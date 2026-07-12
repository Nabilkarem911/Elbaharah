const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const superAdmin = require('../middleware/superAdmin.middleware');
const validate = require('../middleware/validate.middleware');
const { Organization, Branch, User, sequelize } = require('../models');
const { activityTemplates } = require('../config/activity-templates');

// List all organizations
router.get('/', auth, superAdmin, async (req, res, next) => {
  try {
    const orgs = await Organization.findAll({
      include: [{ model: Branch, as: 'branches' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orgs);
  } catch (err) { next(err); }
});

// Get single organization with branches + users count
router.get('/:id', auth, superAdmin, async (req, res, next) => {
  try {
    const org = await Organization.findByPk(req.params.id, {
      include: [
        { model: Branch, as: 'branches' },
        { model: User, as: 'users' },
      ],
    });
    if (!org) return res.status(404).json({ error: 'المنشأة غير موجودة' });
    res.json(org);
  } catch (err) { next(err); }
});

// Create organization + main branch + admin user
router.post('/', auth, superAdmin, [
  body('name').trim().notEmpty().withMessage('اسم المنشأة مطلوب'),
  body('activity_type').isIn(['fish_restaurant', 'restaurant', 'honey_shop', 'retail', 'bakery', 'custom']).withMessage('نوع النشاط غير صحيح'),
  body('admin_username').trim().isLength({ min: 3 }).withMessage('اسم المستخدم 3 أحرف على الأقل'),
  body('admin_password').isLength({ min: 6 }).withMessage('كلمة المرور 6 أحرف على الأقل'),
  body('admin_full_name').trim().notEmpty().withMessage('الاسم الكامل للأدمن مطلوب'),
], validate, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name, activity_type, currency, phone, address, admin_username, admin_password, admin_full_name } = req.body;

    const template = activityTemplates[activity_type] || activityTemplates.custom;

    const org = await Organization.create({
      name,
      activity_type,
      currency: currency || 'SAR',
      phone,
      address,
      labels: template.labels,
    }, { transaction: t });

    const branch = await Branch.create({
      organization_id: org.id,
      name: 'الفرع الرئيسي',
      is_main: true,
    }, { transaction: t });

    const admin = await User.create({
      username: admin_username,
      password_hash: admin_password,
      full_name: admin_full_name,
      role: 'admin',
      organization_id: org.id,
      branch_id: branch.id,
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      organization: org,
      branch,
      admin: admin.toJSON(),
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

// Update organization
router.put('/:id', auth, superAdmin, [
  body('name').trim().notEmpty().withMessage('اسم المنشأة مطلوب'),
], validate, async (req, res, next) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'المنشأة غير موجودة' });
    const { name, phone, address, currency, tax_rate, is_active, logo_url } = req.body;
    await org.update({ name, phone, address, currency, tax_rate, is_active, logo_url });
    res.json(org);
  } catch (err) { next(err); }
});

// Toggle organization active status
router.patch('/:id/toggle', auth, superAdmin, async (req, res, next) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'المنشأة غير موجودة' });
    await org.update({ is_active: !org.is_active });
    res.json({ id: org.id, is_active: org.is_active });
  } catch (err) { next(err); }
});

// Delete organization (cascades to branches)
router.delete('/:id', auth, superAdmin, async (req, res, next) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'المنشأة غير موجودة' });
    await org.destroy();
    res.json({ message: 'تم حذف المنشأة بنجاح' });
  } catch (err) { next(err); }
});

// ---- Branches ----

// List branches for an organization
router.get('/:orgId/branches', auth, superAdmin, async (req, res, next) => {
  try {
    const branches = await Branch.findAll({
      where: { organization_id: req.params.orgId },
      order: [['is_main', 'DESC'], ['createdAt', 'ASC']],
    });
    res.json(branches);
  } catch (err) { next(err); }
});

// Create branch
router.post('/:orgId/branches', auth, superAdmin, [
  body('name').trim().notEmpty().withMessage('اسم الفرع مطلوب'),
], validate, async (req, res, next) => {
  try {
    const org = await Organization.findByPk(req.params.orgId);
    if (!org) return res.status(404).json({ error: 'المنشأة غير موجودة' });
    const branch = await Branch.create({
      organization_id: org.id,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
    });
    res.status(201).json(branch);
  } catch (err) { next(err); }
});

// Update branch
router.put('/:orgId/branches/:branchId', auth, superAdmin, [
  body('name').trim().notEmpty().withMessage('اسم الفرع مطلوب'),
], validate, async (req, res, next) => {
  try {
    const branch = await Branch.findOne({ where: { id: req.params.branchId, organization_id: req.params.orgId } });
    if (!branch) return res.status(404).json({ error: 'الفرع غير موجود' });
    await branch.update({ name: req.body.name, phone: req.body.phone, address: req.body.address, is_active: req.body.is_active });
    res.json(branch);
  } catch (err) { next(err); }
});

// Delete branch (cannot delete main branch)
router.delete('/:orgId/branches/:branchId', auth, superAdmin, async (req, res, next) => {
  try {
    const branch = await Branch.findOne({ where: { id: req.params.branchId, organization_id: req.params.orgId } });
    if (!branch) return res.status(404).json({ error: 'الفرع غير موجود' });
    if (branch.is_main) return res.status(400).json({ error: 'لا يمكن حذف الفرع الرئيسي' });
    await branch.destroy();
    res.json({ message: 'تم حذف الفرع بنجاح' });
  } catch (err) { next(err); }
});

module.exports = router;
