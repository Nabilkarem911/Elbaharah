function createCrudController(Model, modelName, includeAssoc = []) {
  return {
    list: async (req, res, next) => {
      try {
        const { page = 1, limit = 50, ...filters } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        const { Op } = require('sequelize');

        // Auto-filter by organization_id for non-super-admin users
        if (req.user && req.user.role !== 'super_admin' && req.user.organization_id) {
          where.organization_id = req.user.organization_id;
        }

        // Auto-filter by branch_id for non-admin users who have a branch_id
        if (req.user && req.user.branch_id && req.user.role !== 'admin' && Model.rawAttributes.branch_id) {
          if (!where.branch_id) {
            where.branch_id = req.user.branch_id;
          }
        }

        for (const [key, val] of Object.entries(filters)) {
          if (!val && val !== 0) continue;
          if (key === 'page' || key === 'limit') continue;
          if (key.endsWith('_gte')) {
            where[key.slice(0, -4)] = { ...where[key.slice(0, -4)], [Op.gte]: val };
          } else if (key.endsWith('_lte')) {
            where[key.slice(0, -4)] = { ...where[key.slice(0, -4)], [Op.lte]: val };
          } else if (key.endsWith('_gt')) {
            where[key.slice(0, -3)] = { ...where[key.slice(0, -3)], [Op.gt]: val };
          } else if (key.endsWith('_lt')) {
            where[key.slice(0, -3)] = { ...where[key.slice(0, -3)], [Op.lt]: val };
          } else {
            where[key] = val;
          }
        }
        const result = await Model.findAndCountAll({
          where,
          include: includeAssoc,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['id', 'DESC']],
        });
        res.json({
          data: result.rows,
          total: result.count,
          page: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
        });
      } catch (err) {
        next(err);
      }
    },
    getById: async (req, res, next) => {
      try {
        const where = { id: req.params.id };
        if (req.user && req.user.role !== 'super_admin' && req.user.organization_id) {
          where.organization_id = req.user.organization_id;
        }
        const item = await Model.findOne({ where, include: includeAssoc });
        if (!item) return res.status(404).json({ error: `${modelName} غير موجود` });
        res.json(item);
      } catch (err) {
        next(err);
      }
    },
    create: async (req, res, next) => {
      try {
        const data = { ...req.body };
        if (req.user && req.user.id) {
          data.created_by = req.user.id;
        }
        // Auto-assign organization_id for non-super-admin users
        if (req.user && req.user.role !== 'super_admin' && req.user.organization_id && Model.rawAttributes.organization_id) {
          data.organization_id = req.user.organization_id;
        }
        // Auto-assign branch_id if model has it and non-admin user has one
        if (req.user && req.user.branch_id && req.user.role !== 'admin' && Model.rawAttributes.branch_id && !data.branch_id) {
          data.branch_id = req.user.branch_id;
        }
        const item = await Model.create(data);
        res.status(201).json(item);
      } catch (err) {
        next(err);
      }
    },
    update: async (req, res, next) => {
      try {
        const where = { id: req.params.id };
        if (req.user && req.user.role !== 'super_admin' && req.user.organization_id && Model.rawAttributes.organization_id) {
          where.organization_id = req.user.organization_id;
        }
        const item = await Model.findOne({ where });
        if (!item) return res.status(404).json({ error: `${modelName} غير موجود` });
        await item.update(req.body);
        res.json(item);
      } catch (err) {
        next(err);
      }
    },
    remove: async (req, res, next) => {
      try {
        const where = { id: req.params.id };
        if (req.user && req.user.role !== 'super_admin' && req.user.organization_id && Model.rawAttributes.organization_id) {
          where.organization_id = req.user.organization_id;
        }
        const item = await Model.findOne({ where });
        if (!item) return res.status(404).json({ error: `${modelName} غير موجود` });
        await item.destroy();
        res.json({ message: `تم حذف ${modelName} بنجاح` });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = createCrudController;
