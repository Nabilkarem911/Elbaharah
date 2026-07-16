const jwt = require('jsonwebtoken');
const { User, Organization, Branch } = require('../models');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو رقم الهاتف وكلمة المرور' });
    }
    const { Op } = require('sequelize');
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { phone: username },
        ],
      },
      include: [
        { model: Organization, as: 'organization' },
        { model: Branch, as: 'branch' },
      ],
    });
    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'هذا الحساب موقوف — يرجى مراجعة الإدارة' });
    }
    if (user.role !== 'super_admin' && user.organization && !user.organization.is_active) {
      return res.status(403).json({ error: 'هذه المنشأة موقوفة — يرجى مراجعة الإدارة' });
    }
    const valid = await user.validPassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    await user.update({ last_login: new Date() });
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        organization_id: user.organization_id,
        branch_id: user.branch_id,
      },
      process.env.JWT_SECRET || 'elbharah_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Organization, as: 'organization' },
        { model: Branch, as: 'branch' },
      ],
    });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية والجديدة' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' });
    }
    const user = await User.findByPk(req.user.id);
    const valid = await user.validPassword(current_password);
    if (!valid) {
      return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }
    user.password_hash = new_password;
    await user.save();
    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    next(err);
  }
};
