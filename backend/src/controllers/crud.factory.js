function createCrudController(Model, modelName, includeAssoc = []) {
  return {
    list: async (req, res, next) => {
      try {
        const { page = 1, limit = 50, ...filters } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        for (const [key, val] of Object.entries(filters)) {
          if (val && key !== 'page' && key !== 'limit') {
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
        const item = await Model.findByPk(req.params.id, { include: includeAssoc });
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
        const item = await Model.create(data);
        res.status(201).json(item);
      } catch (err) {
        next(err);
      }
    },
    update: async (req, res, next) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: `${modelName} غير موجود` });
        await item.update(req.body);
        res.json(item);
      } catch (err) {
        next(err);
      }
    },
    remove: async (req, res, next) => {
      try {
        const item = await Model.findByPk(req.params.id);
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
