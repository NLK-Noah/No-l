import random
Participants = [
    "NOAH",
    "LENY",
    "NAIMA",
    "DJAMEL",
    "FATMA"
]
if __name__ == "__main__":
    name=input("Entrez votre nom: ")
    name = name.upper()
    if name in Participants:
        index = Participants.index(name)
        others = Participants[:index] + Participants[index+1:]
        recipient = random.choice(others)
        Participants.remove(recipient)
        print(f"Votre destinataire est: {recipient}")