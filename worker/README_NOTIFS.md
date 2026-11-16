# Worker historique

Le worker n'est plus nécessaire si les fonctions `notifyGeneralDiscussion` et `notifySecretDiscussion` sont déployées depuis `functions/`. Ne lance pas les deux systèmes en même temps : ils enverraient des notifications en double.

Pour le test local, le déploiement et les limites du plan Spark, suis [`../functions/README_NOTIFS.md`](../functions/README_NOTIFS.md). Le fichier `serviceAccountKey.json` reste local au worker et ne doit jamais être copié dans `functions/` ni ajouté à Git.
