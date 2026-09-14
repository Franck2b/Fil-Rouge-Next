-- ÉTABLI · données de démarrage
-- Contenu du catalogue uniquement. Les comptes se créent via l'app :
-- voir la fin du fichier pour promouvoir un compte en admin.

insert into workshops (slug, name, city, address, latitude, longitude, opening, description, image_url)
values
  ('paris-11', 'Établi République', 'Paris', '18 rue de la Fonderie, 75011 Paris',
   48.8631, 2.3708, 'Lun–Sam · 9h–20h',
   'Notre atelier historique : 420 m² répartis entre le pôle découpe, la menuiserie et un espace prototypage électronique.',
   '/img/atelier-paris-11.png'),
  ('lyon-7', 'Établi Guillotière', 'Lyon', '7 quai des Ateliers, 69007 Lyon',
   45.7452, 4.8419, 'Lun–Ven · 9h–20h · Sam 10h–18h',
   'Un plateau unique de 300 m² pensé pour les séries courtes : impression 3D, textile technique et métal.',
   '/img/atelier-lyon-7.png'),
  ('nantes-centre', 'Établi Chantiers', 'Nantes', '2 boulevard des Chantiers, 44200 Nantes',
   47.2064, -1.5623, 'Mar–Sam · 10h–19h',
   'Le dernier-né, orienté bois et gros volumes, avec un quai de chargement et un stock de panneaux.',
   '/img/atelier-nantes-centre.png');

insert into machines (workshop_id, slug, name, category, summary, description, hourly_credits, image_url, status)
select w.id, m.slug, m.name, m.category::machine_category, m.summary, m.description, m.hourly_credits, m.image_url, m.status::machine_status
from (values
  ('paris-11', 'trotec-speedy-400', 'Découpeuse laser Trotec Speedy 400', 'laser',
   'CO₂ 120 W, plateau 1000 × 610 mm.',
   'Découpe et gravure sur bois, acrylique, cuir et carton. Extraction filtrée intégrée. Fichiers acceptés en SVG, DXF et AI.',
   3, '/img/machine-laser.png', 'available'),
  ('paris-11', 'prusa-mk4-01', 'Imprimante 3D Prusa MK4 · poste 01', 'impression_3d',
   'FDM, volume 250 × 210 × 220 mm.',
   'Poste polyvalent PLA / PETG. Calibration automatique du plateau, buse 0,4 mm montée par défaut.',
   1, '/img/machine-impression-3d.png', 'available'),
  ('paris-11', 'prusa-mk4-02', 'Imprimante 3D Prusa MK4 · poste 02', 'impression_3d',
   'FDM, volume 250 × 210 × 220 mm.',
   'Identique au poste 01, réservé en priorité aux impressions longues (plus de 6 heures).',
   1, '/img/machine-impression-3d.png', 'available'),
  ('paris-11', 'festool-cs70', 'Scie à format Festool CS 70', 'bois',
   'Coupe de panneaux jusqu''à 70 mm.',
   'Scie sur table avec guide parallèle et chariot. Habilitation bois obligatoire, port des EPI contrôlé à l''entrée.',
   2, '/img/machine-bois.png', 'available'),
  ('paris-11', 'station-jbc-01', 'Station de prototypage électronique', 'electronique',
   'Fer JBC, loupe binoculaire, alimentation de labo.',
   'Poste complet pour le brasage fin et le debug : oscilloscope 100 MHz, multimètre, kit CMS.',
   1, '/img/machine-electronique.png', 'available'),
  ('lyon-7', 'bambu-x1c', 'Imprimante 3D Bambu Lab X1C', 'impression_3d',
   'CoreXY caisson fermé, multi-matériaux.',
   'Pour ABS, ASA et matériaux chargés fibre. Système AMS quatre bobines pour les pièces multicolores.',
   2, '/img/machine-impression-3d.png', 'available'),
  ('lyon-7', 'juki-ddl-8700', 'Piqueuse industrielle Juki DDL-8700', 'textile',
   'Point noué, 5500 points/minute.',
   'Machine de production pour tissus légers à moyens. Canettes et aiguilles fournies par l''atelier.',
   1, '/img/machine-textile.png', 'available'),
  ('lyon-7', 'brother-pr680', 'Brodeuse Brother PR680W', 'textile',
   'Six aiguilles, cadre 360 × 200 mm.',
   'Broderie sur textile et cuir souple. Fichiers PES ou DST, numérisation possible sur place.',
   2, '/img/machine-textile.png', 'available'),
  ('lyon-7', 'tour-optimum-d250', 'Tour à métaux Optimum D250', 'metal',
   'Entre-pointes 550 mm.',
   'Tournage acier, laiton et aluminium. Habilitation métal obligatoire et passage de niveau avec un référent.',
   4, '/img/machine-metal.png', 'available'),
  ('lyon-7', 'poste-tig-200', 'Poste à souder TIG 200 A', 'metal',
   'TIG AC/DC refroidi par air.',
   'Soudure acier, inox et aluminium. Cabine ventilée, masque LCD et gants fournis.',
   3, '/img/machine-metal.png', 'maintenance'),
  ('nantes-centre', 'cnc-shopbot-96', 'CNC bois ShopBot 96', 'bois',
   'Surface utile 2440 × 1220 mm.',
   'Usinage de panneaux grand format. Parcours d''outils à fournir en G-code, vérifiés par un référent avant lancement.',
   4, '/img/machine-bois.png', 'available'),
  ('nantes-centre', 'toupie-felder-700', 'Toupie Felder F700', 'bois',
   'Arbre 30 mm, inclinable.',
   'Profilage et rainurage. Machine classée à risque : habilitation bois et validation d''un référent à chaque session.',
   3, '/img/machine-bois.png', 'available'),
  ('nantes-centre', 'laser-mira-9', 'Découpeuse laser Mira 9', 'laser',
   'CO₂ 60 W, plateau 900 × 600 mm.',
   'Poste secondaire pour la gravure et les petites séries. Idéal pour le contreplaqué fin et le médium.',
   2, '/img/machine-laser.png', 'available'),
  ('nantes-centre', 'prusa-xl', 'Imprimante 3D Prusa XL', 'impression_3d',
   'Volume 360 × 360 × 360 mm.',
   'Grand volume pour les pièces d''une seule tenue. Deux têtes pour l''impression avec support soluble.',
   2, '/img/machine-impression-3d.png', 'available')
) as m (workshop_slug, slug, name, category, summary, description, hourly_credits, image_url, status)
join workshops w on w.slug = m.workshop_slug;

-- Promouvoir un compte en administrateur (à exécuter après l'inscription) :
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'admin@etabli.fr');
