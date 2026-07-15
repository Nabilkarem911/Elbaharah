-- مسح كل السمك والدلالين القديم
TRUNCATE fish_types RESTART IDENTITY CASCADE;
TRUNCATE suppliers RESTART IDENTITY CASCADE;

-- إضافة السمك
INSERT INTO fish_types (code, name, is_active, created_at, updated_at) VALUES
('1',  'شعور',          true, NOW(), NOW()),
('2',  'خرمي',          true, NOW(), NOW()),
('3',  'قمر',           true, NOW(), NOW()),
('4',  'ابو عين',       true, NOW(), NOW()),
('5',  'نجار',          true, NOW(), NOW()),
('6',  'وريق',          true, NOW(), NOW()),
('7',  'فرهودي',        true, NOW(), NOW()),
('8',  'خضاري',         true, NOW(), NOW()),
('9',  'هامور',         true, NOW(), NOW()),
('10', 'ناجل',          true, NOW(), NOW()),
('11', 'شريفي',         true, NOW(), NOW()),
('12', 'ترباني',        true, NOW(), NOW()),
('13', 'فارس',          true, NOW(), NOW()),
('14', 'قص',            true, NOW(), NOW()),
('15', 'سيجان',         true, NOW(), NOW()),
('16', 'بهارة',         true, NOW(), NOW()),
('17', 'حبار',          true, NOW(), NOW()),
('18', 'استكوزا',       true, NOW(), NOW()),
('19', 'صيادية فارس',   true, NOW(), NOW()),
('20', 'صيادية ناجل',   true, NOW(), NOW()),
('21', 'روبيان',        true, NOW(), NOW()),
('22', 'بنت الربان',    true, NOW(), NOW()),
('23', 'بيوضي',         true, NOW(), NOW()),
('24', 'جعابيل',        true, NOW(), NOW()),
('25', 'سلمون',         true, NOW(), NOW()),
('26', 'اعاشة عمال',    true, NOW(), NOW()),
('28', 'بياض',          true, NOW(), NOW());

-- إضافة الدلالين
INSERT INTO suppliers (code, name, balance, is_active, created_at, updated_at) VALUES
('1',  'بن وازن',           0, true, NOW(), NOW()),
('2',  'عاشور',             0, true, NOW(), NOW()),
('3',  'أبو نواف',          0, true, NOW(), NOW()),
('4',  'طلال',              0, true, NOW(), NOW()),
('5',  'عبدالله ثويمر',     0, true, NOW(), NOW()),
('6',  'جدة',               0, true, NOW(), NOW()),
('7',  'عبدالمنعم',         0, true, NOW(), NOW()),
('8',  'حمدان',             0, true, NOW(), NOW()),
('9',  'عميد البحارة',      0, true, NOW(), NOW()),
('10', 'عطيوي الرفاعي',     0, true, NOW(), NOW()),
('11', 'مستورة',            0, true, NOW(), NOW()),
('12', 'البنقلة',           0, true, NOW(), NOW()),
('13', 'الشريف',            0, true, NOW(), NOW()),
('14', 'البرك',             0, true, NOW(), NOW()),
('15', 'رامي - مستورة',     0, true, NOW(), NOW()),
('16', 'معاذ الجباري',      0, true, NOW(), NOW()),
('17', 'جازان',             0, true, NOW(), NOW());
