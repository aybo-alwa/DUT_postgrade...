CREATE TABLE public.catalogue_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  faculty TEXT NOT NULL,
  level TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 15,
  semester TEXT NOT NULL DEFAULT 'Semester 1',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.catalogue_modules TO authenticated;
GRANT ALL ON public.catalogue_modules TO service_role;
ALTER TABLE public.catalogue_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalogue is readable by signed-in users" ON public.catalogue_modules FOR SELECT TO authenticated USING (true);

CREATE TABLE public.module_enrolments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  module_code TEXT NOT NULL REFERENCES public.catalogue_modules(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_enrolments TO authenticated;
GRANT ALL ON public.module_enrolments TO service_role;
ALTER TABLE public.module_enrolments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own enrolments" ON public.module_enrolments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  space_key TEXT NOT NULL,
  nickname TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_space_created_idx ON public.chat_messages (space_key, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read chat" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users send chat as themselves" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their own chat" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

INSERT INTO public.catalogue_modules (code, title, faculty, level, credits, semester, description) VALUES
('RES701','Research Design & Methodology','Research Core','Masters',20,'Semester 1','Framing researchable questions and matching them to a defensible design.'),
('RES702','Advanced Qualitative Methods','Research Core','Masters',20,'Semester 1','Interviewing, focus groups, thematic and narrative analysis.'),
('RES703','Advanced Quantitative Methods','Research Core','Masters',20,'Semester 2','Sampling, measurement, inferential testing and reporting.'),
('RES704','Mixed Methods Research','Research Core','Masters',15,'Semester 2','Integration strategies, sequencing and joint displays.'),
('RES705','Systematic Literature Review','Research Core','Masters',15,'Semester 1','Search protocols, screening, appraisal and synthesis.'),
('RES706','Research Ethics & Integrity','Research Core','Masters',10,'Semester 1','Ethics applications, consent, vulnerability and data protection.'),
('RES707','Academic Writing for Publication','Research Core','Masters',15,'Semester 2','From chapter to journal article, with reviewer expectations.'),
('RES708','Proposal Defence Preparation','Research Core','Masters',10,'Semester 1','Building and defending a proposal before a faculty panel.'),
('RES709','Viva Voce Preparation','Research Core','Doctoral',10,'Semester 2','Anticipating examiner questions and defending contribution.'),
('RES710','Scholarly Argumentation','Research Core','Doctoral',15,'Semester 1','Constructing contribution claims and theoretical positioning.'),
('DAT801','Statistical Computing with R','Data & Analytics','Masters',20,'Semester 1','Data wrangling, visualisation and modelling in R.'),
('DAT802','Python for Research Data','Data & Analytics','Masters',20,'Semester 1','Pandas, notebooks and reproducible analysis pipelines.'),
('DAT803','Survey Data Analysis with SPSS','Data & Analytics','Masters',15,'Semester 2','Coding, cleaning and analysing survey instruments.'),
('DAT804','Qualitative Analysis with NVivo','Data & Analytics','Masters',15,'Semester 2','Coding frames, memoing and audit trails.'),
('DAT805','Structural Equation Modelling','Data & Analytics','Doctoral',20,'Semester 2','Measurement and structural models, fit and reporting.'),
('DAT806','Data Visualisation & Storytelling','Data & Analytics','Masters',10,'Semester 1','Charts that argue, not decorate.'),
('DAT807','Machine Learning for Social Research','Data & Analytics','Doctoral',20,'Semester 2','Supervised methods, validation and interpretability.'),
('DAT808','Research Data Management','Data & Analytics','Masters',10,'Semester 1','FAIR data, repositories and long-term stewardship.'),
('MGT601','Organisational Behaviour','Management Sciences','Masters',20,'Semester 1','Motivation, teams, culture and change in organisations.'),
('MGT602','Strategic Management','Management Sciences','Masters',20,'Semester 1','Competitive analysis, capability and strategy execution.'),
('MGT603','Human Resource Development','Management Sciences','Masters',15,'Semester 2','Learning, talent pipelines and workforce capability.'),
('MGT604','Public Sector Governance','Management Sciences','Masters',15,'Semester 2','Accountability, oversight and service delivery.'),
('MGT605','Entrepreneurship & Innovation','Management Sciences','Masters',15,'Semester 1','Opportunity recognition and venture design.'),
('MGT606','Project Management for Research','Management Sciences','Masters',10,'Semester 2','Scope, schedule and risk for a research project.'),
('EDU501','Curriculum Studies','Education','Masters',20,'Semester 1','Curriculum theory, design and enactment.'),
('EDU502','Inclusive Education & Universal Design','Education','Masters',20,'Semester 1','Designing learning that works for every student.'),
('EDU503','Educational Assessment','Education','Masters',15,'Semester 2','Validity, reliability and assessment for learning.'),
('EDU504','Digital Pedagogies','Education','Masters',15,'Semester 2','Blended and online learning design.'),
('EDU505','Higher Education Supervision','Education','Doctoral',15,'Semester 1','Supervisory relationships and postgraduate throughput.'),
('HSC401','Public Health Research Methods','Health Sciences','Masters',20,'Semester 1','Epidemiological designs and community health research.'),
('HSC402','Health Systems & Policy','Health Sciences','Masters',20,'Semester 2','Financing, access and policy implementation.'),
('HSC403','Clinical Trial Design','Health Sciences','Doctoral',20,'Semester 2','Randomisation, blinding, endpoints and governance.'),
('HSC404','Community Health Promotion','Health Sciences','Masters',15,'Semester 1','Behaviour change and participatory intervention design.'),
('HSC405','Bioethics','Health Sciences','Masters',10,'Semester 2','Ethical reasoning in clinical and research practice.'),
('ENG301','Advanced Engineering Mathematics','Engineering & Built Environment','Masters',20,'Semester 1','Modelling, transforms and numerical methods.'),
('ENG302','Sustainable Infrastructure','Engineering & Built Environment','Masters',20,'Semester 1','Life-cycle thinking for resilient infrastructure.'),
('ENG303','Renewable Energy Systems','Engineering & Built Environment','Masters',20,'Semester 2','Generation, storage and grid integration.'),
('ENG304','Water & Wastewater Engineering','Engineering & Built Environment','Masters',15,'Semester 2','Treatment processes and municipal systems.'),
('ENG305','Urban & Regional Planning','Engineering & Built Environment','Masters',15,'Semester 1','Spatial planning, housing and mobility.'),
('ICT201','Advanced Software Engineering','Applied Sciences & ICT','Masters',20,'Semester 1','Architecture, testing and delivery at scale.'),
('ICT202','Information Systems Security','Applied Sciences & ICT','Masters',20,'Semester 2','Threat modelling, controls and governance.'),
('ICT203','Human-Computer Interaction','Applied Sciences & ICT','Masters',15,'Semester 1','Usability, accessibility and interaction design research.'),
('ICT204','Cloud & Distributed Systems','Applied Sciences & ICT','Masters',15,'Semester 2','Scalability, reliability and distributed data.'),
('ICT205','Artificial Intelligence Ethics','Applied Sciences & ICT','Doctoral',10,'Semester 2','Fairness, accountability and responsible deployment.'),
('ART101','Visual Culture & Criticism','Arts & Design','Masters',20,'Semester 1','Reading images, media and material culture.'),
('ART102','Practice-Based Research','Arts & Design','Masters',20,'Semester 2','Making as method, documentation and exegesis.'),
('ART103','Heritage & Museum Studies','Arts & Design','Masters',15,'Semester 1','Collections, curation and contested heritage.'),
('LAN110','Academic English for Researchers','Language & Communication','Masters',10,'Semester 1','Clarity, cohesion and academic register.'),
('LAN111','isiZulu for Fieldwork','Language & Communication','Masters',10,'Semester 2','Practical language skills for community research.'),
('LAN112','Research Communication & Public Engagement','Language & Communication','Masters',10,'Semester 2','Conference talks, posters and media engagement.');