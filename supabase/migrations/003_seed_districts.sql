-- ====================================================================
-- MIGRATION 003: SEED ALL 64 DISTRICTS OF BANGLADESH
-- Grouped by the 8 official Administrative Divisions
-- ====================================================================

INSERT INTO public.districts (name_en, name_bn, division, geo_code) VALUES
-- --------------------------------------------------------------------
-- DHAKA DIVISION (13 Districts)
-- --------------------------------------------------------------------
('Dhaka', 'ঢাকা', 'Dhaka', 'BD-13'),
('Gazipur', 'গাজীপুর', 'Dhaka', 'BD-18'),
('Kishoreganj', 'কিশোরগঞ্জ', 'Dhaka', 'BD-26'),
('Manikganj', 'মানিকগঞ্জ', 'Dhaka', 'BD-33'),
('Munshiganj', 'মুন্সীগঞ্জ', 'Dhaka', 'BD-35'),
('Narayanganj', 'নারায়ণগঞ্জ', 'Dhaka', 'BD-38'),
('Narsingdi', 'নরসিংদী', 'Dhaka', 'BD-41'),
('Tangail', 'টাঙ্গাইল', 'Dhaka', 'BD-63'),
('Faridpur', 'ফরিদপুর', 'Dhaka', 'BD-15'),
('Gopalganj', 'গোপালগঞ্জ', 'Dhaka', 'BD-17'),
('Madaripur', 'মাদারীপুর', 'Dhaka', 'BD-28'),
('Rajbari', 'রাজবাড়ী', 'Dhaka', 'BD-53'),
('Shariatpur', 'শরীয়তপুর', 'Dhaka', 'BD-60'),

-- --------------------------------------------------------------------
-- CHITTAGONG DIVISION (11 Districts)
-- --------------------------------------------------------------------
('Chittagong', 'চট্টগ্রাম', 'Chittagong', 'BD-10'),
('Cox''s Bazar', 'কক্সবাজার', 'Chittagong', 'BD-11'),
('Rangamati', 'রাঙ্গামাটি', 'Chittagong', 'BD-56'),
('Bandarban', 'বান্দরবান', 'Chittagong', 'BD-01'),
('Khagrachhari', 'খাগড়াছড়ি', 'Chittagong', 'BD-24'),
('Feni', 'ফেনী', 'Chittagong', 'BD-16'),
('Lakshmipur', 'লক্ষ্মীপুর', 'Chittagong', 'BD-31'),
('Comilla', 'কুমিল্লা', 'Chittagong', 'BD-08'),
('Noakhali', 'নোয়াখালী', 'Chittagong', 'BD-47'),
('Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'Chittagong', 'BD-04'),
('Chandpur', 'চাঁদপুর', 'Chittagong', 'BD-09'),

-- --------------------------------------------------------------------
-- RAJSHAHI DIVISION (8 Districts)
-- --------------------------------------------------------------------
('Rajshahi', 'রাজশাহী', 'Rajshahi', 'BD-54'),
('Natore', 'নাটোর', 'Rajshahi', 'BD-44'),
('Naogaon', 'নওগাঁ', 'Rajshahi', 'BD-37'),
('Chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 'Rajshahi', 'BD-45'),
('Pabna', 'পাবনা', 'Rajshahi', 'BD-49'),
('Sirajganj', 'সিরাজগঞ্জ', 'Rajshahi', 'BD-59'),
('Bogra', 'বগুড়া', 'Rajshahi', 'BD-03'),
('Joypurhat', 'জয়পুরহাট', 'Rajshahi', 'BD-20'),

-- --------------------------------------------------------------------
-- KHULNA DIVISION (10 Districts)
-- --------------------------------------------------------------------
('Khulna', 'খুলনা', 'Khulna', 'BD-27'),
('Bagerhat', 'বাগেরহাট', 'Khulna', 'BD-05'),
('Satkhira', 'সাতক্ষীরা', 'Khulna', 'BD-58'),
('Jessore', 'যশোর', 'Khulna', 'BD-22'),
('Magura', 'মাগুরা', 'Khulna', 'BD-32'),
('Jhenaidah', 'ঝিনাইদহ', 'Khulna', 'BD-23'),
('Narail', 'নড়াইল', 'Khulna', 'BD-40'),
('Kushtia', 'কুষ্টিয়া', 'Khulna', 'BD-30'),
('Meherpur', 'মেহেরপুর', 'Khulna', 'BD-34'),
('Chuadanga', 'চুয়াডাঙ্গা', 'Khulna', 'BD-12'),

-- --------------------------------------------------------------------
-- BARISAL DIVISION (6 Districts)
-- --------------------------------------------------------------------
('Barisal', 'বরিশাল', 'Barisal', 'BD-06'),
('Bhola', 'ভোলা', 'Barisal', 'BD-07'),
('Jhalokati', 'ঝালকাঠি', 'Barisal', 'BD-21'),
('Pirojpur', 'পিরোজপুর', 'Barisal', 'BD-50'),
('Barguna', 'বরগুনা', 'Barisal', 'BD-02'),
('Patuakhali', 'পটুয়াখালী', 'Barisal', 'BD-51'),

-- --------------------------------------------------------------------
-- SYLHET DIVISION (4 Districts)
-- --------------------------------------------------------------------
('Sylhet', 'সিলেট', 'Sylhet', 'BD-62'),
('Moulvibazar', 'মৌলভীবাজার', 'Sylhet', 'BD-36'),
('Habiganj', 'হবিগঞ্জ', 'Sylhet', 'BD-19'),
('Sunamganj', 'সুনামগঞ্জ', 'Sylhet', 'BD-61'),

-- --------------------------------------------------------------------
-- RANGPUR DIVISION (8 Districts)
-- --------------------------------------------------------------------
('Rangpur', 'রংপুর', 'Rangpur', 'BD-55'),
('Gaibandha', 'গাইবান্ধা', 'Rangpur', 'BD-14'),
('Kurigram', 'কুড়িগ্রাম', 'Rangpur', 'BD-25'),
('Nilphamari', 'নীলফামারী', 'Rangpur', 'BD-46'),
('Lalmonirhat', 'লালমনিরহাট', 'Rangpur', 'BD-32-R'),
('Dinajpur', 'দিনাজপুর', 'Rangpur', 'BD-14-D'),
('Thakurgaon', 'ঠাকুরগাঁও', 'Rangpur', 'BD-64'),
('Panchagarh', 'পঞ্চগড়', 'Rangpur', 'BD-52'),

-- --------------------------------------------------------------------
-- MYMENSINGH DIVISION (4 Districts)
-- --------------------------------------------------------------------
('Mymensingh', 'ময়মনসিংহ', 'Mymensingh', 'BD-39'),
('Jamalpur', 'জামালপুর', 'Mymensingh', 'BD-21-J'),
('Netrokona', 'নেত্রকোণা', 'Mymensingh', 'BD-43'),
('Sherpur', 'শেরপুর', 'Mymensingh', 'BD-57')

ON CONFLICT (geo_code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_bn = EXCLUDED.name_bn,
  division = EXCLUDED.division;

-- --------------------------------------------------------------------
-- SEED SAMPLE NATIONAL EMERGENCY HELPLINE NUMBERS
-- --------------------------------------------------------------------
INSERT INTO public.helpline_contacts (name, phone_number, category, district_id) VALUES
('Bangladesh Police National Emergency', '999', 'police', NULL),
('Violence Against Women & Children Hotline', '109', 'human_rights_org', NULL),
('National Human Rights Commission BD', '16108', 'minority_affairs', NULL),
('Government Legal Aid Services', '16430', 'emergency_other', NULL)
ON CONFLICT DO NOTHING;
