#!/usr/bin/env python3
"""
Seed script for 24 Advent Calendar Daily Games into Firebase Firestore via REST API.
"""

import json
import urllib.request
import sys

API_KEY = "AIzaSyBVQh_y9U1D5gA7BmCCFJgOlEPlUAogxV8"
PROJECT_ID = "santa-secret-3c1f4"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/daily_games"

GAMES = [
    {
        "day": 1,
        "type": "juste_prix",
        "title": "Le Pull de Noël Lumineux Dark Vador",
        "item": "Pull de Noël LED Star Wars Dark Vador",
        "description": "Pull festif officiel tricoté sous licence officielle avec 12 mini-LED clignotantes.",
        "actualPrice": 45,
        "imageUrl": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600"
    },
    {
        "day": 2,
        "type": "pendu",
        "title": "Gourmandise d'Antan",
        "word": "PAIN DEPICES",
        "clue": "Gâteau traditionnel au miel et aux épices découpé en bonhomme."
    },
    {
        "day": 3,
        "type": "quiz",
        "title": "Cinéma & Coutumes Mondiales",
        "questions": [
            {
                "q": "Dans 'Maman, j'ai raté l'avion', où la famille McCallister part-elle fêter Noël ?",
                "options": ["Paris", "Rome", "Londres", "Tokyo"],
                "answerIndex": 0
            },
            {
                "q": "Dans quel pays déguste-t-on traditionnellement du poulet frit le soir du 24 décembre ?",
                "options": ["Corée du Sud", "Japon", "Islande", "Australie"],
                "answerIndex": 1
            },
            {
                "q": "Combien de rennes tirent le traîneau du Père Noël dans le poème historique de 1823 ?",
                "options": ["6", "8", "9", "12"],
                "answerIndex": 1
            }
        ]
    },
    {
        "day": 4,
        "type": "annee",
        "title": "Sortie du film culte 'Le Grinch'",
        "target": "Le film 'Le Grinch' avec Jim Carrey",
        "clue": "Réalisé par Ron Howard pour inaugurer le nouveau millénaire.",
        "actualYear": 2000
    },
    {
        "day": 5,
        "type": "juste_prix",
        "title": "Lego Sapin de Noël 2-en-1",
        "item": "Lego Creator 40573 - Le Sapin de Noël",
        "description": "Set officiel de 784 pièces permettant de monter un grand sapin ou 2 sapins de table.",
        "actualPrice": 40,
        "imageUrl": "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600"
    },
    {
        "day": 6,
        "type": "pendu",
        "title": "Personnage Féerique",
        "word": "CASSE NOISETTE",
        "clue": "Soldat de bois qui prend vie dans le célèbre ballet de Tchaïkovski."
    },
    {
        "day": 7,
        "type": "quiz",
        "title": "Musique & Records d'Hiver",
        "questions": [
            {
                "q": "En quelle année est sorti le tube planétaire 'All I Want for Christmas Is You' de Mariah Carey ?",
                "options": ["1990", "1994", "1998", "2001"],
                "answerIndex": 1
            },
            {
                "q": "Quel est le nom du célèbre renne au nez rouge ?",
                "options": ["Comète", "Rudolphe", "Cupidon", "Éclair"],
                "answerIndex": 1
            },
            {
                "q": "Quelle boisson chaude épicée nordique boit-on traditionnellement en hiver ?",
                "options": ["Glögg", "Kombucha", "Mate", "Rooibos"],
                "answerIndex": 0
            }
        ]
    },
    {
        "day": 8,
        "type": "annee",
        "title": "La Game Boy sous le sapin",
        "target": "Sortie de la Nintendo Game Boy originale en Europe",
        "clue": "La légendaire console portable grise fournie avec Tetris.",
        "actualYear": 1990
    },
    {
        "day": 9,
        "type": "juste_prix",
        "title": "Chocolatière Électrique Vintage",
        "item": "Chocolatière émulsionneur vintage rétro",
        "description": "Machine pour préparer 1L de chocolat chaud onctueux et mousseux comme au chalet.",
        "actualPrice": 60,
        "imageUrl": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600"
    },
    {
        "day": 10,
        "type": "pendu",
        "title": "Magie Polaire",
        "word": "AURORE BOREALE",
        "clue": "Lueurs féeriques vertes et violettes dansant dans le ciel arctique."
    },
    {
        "day": 11,
        "type": "quiz",
        "title": "Contes & Géographie",
        "questions": [
            {
                "q": "Dans quelle région de Finlande se situe le village officiel du Père Noël (Rovaniemi) ?",
                "options": ["Laponie", "Carélie", "Pirkanmaa", "Åland"],
                "answerIndex": 0
            },
            {
                "q": "Dans 'L'Étrange Noël de monsieur Jack' de Tim Burton, qui est le roi des citrouilles ?",
                "options": ["Oogie Boogie", "Jack Skellington", "Zero", "Maire"],
                "answerIndex": 1
            },
            {
                "q": "Combien y a-t-il de jours entre Noël (25 déc) et l'Épiphanie (6 janv) ?",
                "options": ["8", "10", "12", "14"],
                "answerIndex": 2
            }
        ]
    },
    {
        "day": 12,
        "type": "annee",
        "title": "Comédie Culte du Splendid",
        "target": "Sortie en salle du film 'Le père Noël est une ordure'",
        "clue": "Pierre et Thérèse à la permanence de SOS Détresse Amitié.",
        "actualYear": 1982
    },
    {
        "day": 13,
        "type": "juste_prix",
        "title": "Casque Audio Sony WH-1000XM5",
        "item": "Casque Bluetooth Sony WH-1000XM5 Réduction de Bruit",
        "description": "Casque arceau star des cadeaux high-tech avec autonomie de 30 heures.",
        "actualPrice": 330,
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    },
    {
        "day": 14,
        "type": "pendu",
        "title": "Joie de l'Hiver",
        "word": "BOULE DE NEIGE",
        "clue": "Projectile glacé amical ou sphère féerique que l'on secoue."
    },
    {
        "day": 15,
        "type": "quiz",
        "title": "Traditions & Gastronomie",
        "questions": [
            {
                "q": "D'où vient historiquement la tradition de la bûche de Noël mangée en dessert ?",
                "options": ["D'un gâteau russe", "D'une vraie bûche brûlée dans l'âtre", "D'une fête romaine du blé", "D'un pâtissier américain"],
                "answerIndex": 1
            },
            {
                "q": "Quel prince a popularisé le sapin de Noël en Angleterre aux côtés de la reine Victoria ?",
                "options": ["Prince Albert", "George IV", "Édouard VII", "Guillaume IV"],
                "answerIndex": 0
            },
            {
                "q": "Dans quel célèbre film de Noël Hugh Grant incarne-t-il le Premier ministre britannique ?",
                "options": ["Love Actually", "The Holiday", "Coup de foudre à Notting Hill", "Bridget Jones"],
                "answerIndex": 0
            }
        ]
    },
    {
        "day": 16,
        "type": "annee",
        "title": "Le Train Magique",
        "target": "Sortie du film d'animation 'Le Pôle Express'",
        "clue": "Le voyage ferroviaire fantastique réalisé par Robert Zemeckis avec Tom Hanks.",
        "actualYear": 2004
    },
    {
        "day": 17,
        "type": "juste_prix",
        "title": "Plaid Chauffant XXL Fausse Fourrure",
        "item": "Plaid chauffant électrique 180x130cm",
        "description": "Couverture chauffante ultra-douce lavable avec 6 niveaux de chaleur.",
        "actualPrice": 55,
        "imageUrl": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"
    },
    {
        "day": 18,
        "type": "pendu",
        "title": "Esprit Farceur",
        "word": "LUTIN FARCEUR",
        "clue": "Petite créature de Noël 'Elf on the Shelf' qui fait des bêtises la nuit."
    },
    {
        "day": 19,
        "type": "quiz",
        "title": "Légendes Internationales",
        "questions": [
            {
                "q": "En Espagne, comment appelle-t-on la célèbre loterie géante de Noël du 22 décembre ?",
                "options": ["El Niño", "El Gordo", "La Primitiva", "Bonoloto"],
                "answerIndex": 1
            },
            {
                "q": "En Italie, qui apporte des douceurs aux enfants la nuit de l'Épiphanie le 6 janvier ?",
                "options": ["Babbo Natale", "La Befana", "San Nicola", "Strega Nona"],
                "answerIndex": 1
            },
            {
                "q": "Quel objet magique donne vie au bonhomme de neige Frosty dans la chanson légendaire ?",
                "options": ["Son écharpe", "Son balai", "Un vieux chapeau en soie", "Son nez en carotte"],
                "answerIndex": 2
            }
        ]
    },
    {
        "day": 20,
        "type": "annee",
        "title": "La Nintendo Switch au pied du sapin",
        "target": "Lancement mondial de la console hybride Nintendo Switch",
        "clue": "Avec Zelda: Breath of the Wild le jour de sa sortie.",
        "actualYear": 2017
    },
    {
        "day": 21,
        "type": "juste_prix",
        "title": "Appareil à Raclette Traditionnelle Alpage",
        "item": "Appareil à raclette 1/2 meule de chalet",
        "description": "Appareil avec porte-fromage inclinable pour racler directement la meule dorée.",
        "actualPrice": 160,
        "imageUrl": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600"
    },
    {
        "day": 22,
        "type": "pendu",
        "title": "Délicatesse Sucrée",
        "word": "MARRON GLACE",
        "clue": "Châtaigne noble confite dans un sirop de sucre vanillé puis glacée."
    },
    {
        "day": 23,
        "type": "quiz",
        "title": "Ultime Tour de Table",
        "questions": [
            {
                "q": "Dans quelle comédie Will Ferrell incarne-t-il un humain élevé par les lutins du Père Noël ?",
                "options": ["Elfe", "Le Grinch", "Super Noël", "Bad Santa"],
                "answerIndex": 0
            },
            {
                "q": "Dans quelle ville peut-on admirer le sapin géant illuminé du Rockefeller Center ?",
                "options": ["Chicago", "New York", "Boston", "Toronto"],
                "answerIndex": 1
            },
            {
                "q": "Dans 'Le Père Noël est une ordure', de quelle couleur est le célèbre gilet tricoté par Thérèse ?",
                "options": ["Bleu canard", "Gris souris", "Marron", "Vert bouteille"],
                "answerIndex": 1
            }
        ]
    },
    {
        "day": 24,
        "type": "annee",
        "title": "Le Réveillon de John McClane",
        "target": "Sortie du film d'action de Noël 'Piège de Cristal' (Die Hard)",
        "clue": "Bruce Willis seul contre les terroristes dans la tour Nakatomi Plaza le 24 décembre.",
        "actualYear": 1988
    }
]

def format_firestore_value(val):
    if isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, int):
        return {"integerValue": str(val)}
    elif isinstance(val, float):
        return {"doubleValue": val}
    elif isinstance(val, str):
        return {"stringValue": val}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [format_firestore_value(v) for v in val]}}
    elif isinstance(val, dict):
        return {"mapValue": {"fields": {k: format_firestore_value(v) for k, v in val.items()}}}
    return {"nullValue": None}

def seed():
    print(f"🚀 Début de l'envoi des 24 jeux vers Firestore ({PROJECT_ID})...")
    success_count = 0
    for game in GAMES:
        day_num = game["day"]
        doc_id = f"day_{day_num}"
        url = f"{BASE_URL}/{doc_id}?key={API_KEY}"
        
        fields = {}
        for k, v in game.items():
            fields[k] = format_firestore_value(v)
            
        payload = json.dumps({"fields": fields}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="PATCH")
        
        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status == 200:
                    print(f"  ✅ Jour {day_num:02d} ({game['type']}) : {game['title']}")
                    success_count += 1
                else:
                    print(f"  ⚠️ Jour {day_num} : statut HTTP {resp.status}")
        except Exception as e:
            print(f"  ❌ Erreur sur jour {day_num} : {e}")

    print(f"\n🎉 Terminé ! {success_count}/24 jeux enregistrés avec succès dans Firestore collection 'daily_games' !")

if __name__ == "__main__":
    seed()
