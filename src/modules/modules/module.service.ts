import { ApiError } from "../../utils/ApiError.js";
import { moduleRepository } from "./module.repository.js";
import {
  CreateModuleInput,
  ModuleDocument,
  ModuleTreeNode,
  UpdateModuleInput,
} from "./module.types.js";

const normalizeCode = (code: string) => {
  return code.trim().toUpperCase();
};

const buildTree = (modules: ModuleDocument[]): ModuleTreeNode[] => {
  const nodeMap = new Map<string, ModuleTreeNode>();
  const roots: ModuleTreeNode[] = [];

  modules.forEach((moduleDoc) => {
    nodeMap.set(moduleDoc._id.toString(), { ...moduleDoc, children: [] });
  });

  modules.forEach((moduleDoc) => {
    const node = nodeMap.get(moduleDoc._id.toString())!;
    const parentId = moduleDoc.parentModuleId?.toString();

    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(node);
    } else {
      // No parent, or parent isn't in this active set (e.g. an inactive
      // parent) - treat as a root so it still surfaces in the tree.
      roots.push(node);
    }
  });

  return roots;
};

export const moduleService = {
  async create(data: CreateModuleInput) {
    const normalizedCode = normalizeCode(data.code);
    const existingModule = await moduleRepository.findByCode(normalizedCode);
    if (existingModule) {
      throw new ApiError(
        409,
        `Module with code ${normalizedCode} already exists`,
      );
    }

    if (data.parentModuleId) {
      const parent = await moduleRepository.findById(data.parentModuleId);
      if (!parent) {
        throw new ApiError(404, "Parent module not found");
      }
    }

    try {
      return await moduleRepository.create({
        ...data,
        code: normalizedCode,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ApiError(
          409,
          `Module with code "${normalizedCode}" already exists`,
        );
      }

      throw error;
    }
  },

  async getAll(options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    parentModuleId?: string;
  }) {
    return moduleRepository.findAll(options);
  },

  async getTree() {
    const modules = await moduleRepository.findAllActive();
    return buildTree(modules as unknown as ModuleDocument[]);
  },

  async getById(moduleId: string) {
    const moduleDoc = await moduleRepository.findById(moduleId);
    if (!moduleDoc) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }
    return moduleDoc;
  },

  async update(moduleId: string, data: UpdateModuleInput) {
    const existingModule = await moduleRepository.findById(moduleId);

    if (!existingModule) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }

    if (data.parentModuleId !== undefined && data.parentModuleId !== null) {
      if (data.parentModuleId === moduleId) {
        throw new ApiError(400, "A module cannot be its own parent");
      }

      const parent = await moduleRepository.findById(data.parentModuleId);
      if (!parent) {
        throw new ApiError(404, "Parent module not found");
      }

      // Cycle guard: walk up the candidate parent's ancestor chain. If this
      // module's own id shows up anywhere in that chain, applying the
      // change would create a loop (e.g. making VEHICLE a child of one of
      // VEHICLE's own descendants).
      let current: { parentModuleId?: unknown } | null = parent;
      const visited = new Set<string>();

      while (current?.parentModuleId) {
        const currentParentId = String(current.parentModuleId);

        if (currentParentId === moduleId) {
          throw new ApiError(
            400,
            "This change would create a circular module hierarchy",
          );
        }

        // Safety net in case bad data already has a loop in it - without
        // this, a pre-existing cycle would make this walk infinite.
        if (visited.has(currentParentId)) break;
        visited.add(currentParentId);

        current = await moduleRepository.findById(currentParentId);
      }
    }

    const updatedModule = await moduleRepository.updateById(moduleId, data);

    if (!updatedModule) {
      throw new ApiError(404, "Module not found");
    }

    return updatedModule;
  },

  async updateStatus(moduleId: string, isActive: boolean) {
    const updatedModule = await moduleRepository.updateStatus(
      moduleId,
      isActive,
    );

    if (!updatedModule) {
      throw new ApiError(404, "Module not found");
    }

    return updatedModule;
  },

  async remove(moduleId: string) {
    const moduleDoc = await moduleRepository.findById(moduleId);
    if (!moduleDoc) {
      throw new ApiError(404, `Module with id ${moduleId} not found`);
    }

    const childCount = await moduleRepository.countChildren(moduleId);
    if (childCount > 0) {
      throw new ApiError(409, "Cannot delete module with child modules");
    }

    // TODO (Phase 6 - Permissions): before deleting, check whether any
    // Permission document still references this moduleId and, if so, deny
    // the delete - same referential-integrity guard Action/Role need.

    await moduleRepository.deleteById(moduleId);
    return null;
  },
};
