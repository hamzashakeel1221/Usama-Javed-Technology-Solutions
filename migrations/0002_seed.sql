-- The two projects from the company profile, so the site isn't empty on day one
INSERT INTO projects (title_en, title_ar, description_en, description_ar, location, category, status, year, partner, is_featured, sort_order, is_published, created_at) VALUES
('Ash Mount School', 'مدرسة آش ماونت',
 'Structured cabling and networking works for a school campus in Mudon, delivered with Orion Contracting.',
 'أعمال الكابلات المهيكلة والشبكات لحرم مدرسي في مدن، بالتعاون مع أوريون للمقاولات.',
 'Mudon, Dubai', 'cabling', 'Completed', 2026, 'Orion Contracting', 1, 1, 1, '2026-11-23T00:00:00.000Z'),
('Damac Lagoons', 'داماك لاقونز',
 'Villa cabling, network points and data outlets for residential units in Damac Lagoons.',
 'تمديدات كابلات الفلل ونقاط الشبكة ومخارج البيانات للوحدات السكنية في داماك لاقونز.',
 'Dubai', 'villa', 'Completed', 2026, NULL, 1, 2, 1, '2026-11-23T00:00:00.000Z');
