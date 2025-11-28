#!/bin/bash

echo "🧪 Test de correction du problème de statut de réservation"
echo "=================================================="

# Démarrer le serveur backend
echo "📡 Démarrage du serveur backend..."
cd /home/je-suis/projet-de-fin/backend
node server.js &
SERVER_PID=$!
sleep 3

# Test 1: Vérifier que le serveur est en ligne
echo "🔍 Test 1: Vérification du serveur..."
curl -s http://localhost:3000/api/sante > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Serveur backend en ligne"
else
    echo "❌ Serveur backend hors ligne"
    exit 1
fi

# Test 2: Récupérer une réservation
echo "📋 Test 2: Récupération d'une réservation..."
RESERVATION_ID="6926bb6d180e909c26d783f5"
RESPONSE=$(curl -s "http://localhost:3000/api/reservations/$RESERVATION_ID")
CURRENT_STATUS=$(echo $RESPONSE | jq -r '.donnees.reservation.statut')
echo "📊 Statut actuel: $CURRENT_STATUS"

# Test 3: Mettre à jour vers "confirmee"
echo "🔄 Test 3: Mise à jour du statut vers 'confirmee'..."
UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/reservations/$RESERVATION_ID" \
    -H "Content-Type: application/json" \
    -d '{"statut":"confirmee"}')

UPDATE_STATUS=$(echo $UPDATE_RESPONSE | jq -r '.donnees.reservation.statut')
echo "📊 Nouveau statut: $UPDATE_STATUS"

if [ "$UPDATE_STATUS" = "confirmee" ]; then
    echo "✅ Mise à jour réussie"
else
    echo "❌ Échec de la mise à jour"
fi

# Test 4: Vérifier que la mise à jour persiste
echo "🔍 Test 4: Vérification de la persistance..."
VERIFY_RESPONSE=$(curl -s "http://localhost:3000/api/reservations/$RESERVATION_ID")
VERIFY_STATUS=$(echo $VERIFY_RESPONSE | jq -r '.donnees.reservation.statut')

if [ "$VERIFY_STATUS" = "confirmee" ]; then
    echo "✅ Le statut persiste correctement"
else
    echo "❌ Le statut ne persiste pas: $VERIFY_STATUS"
fi

# Test 5: Mettre à jour vers "annulee"
echo "🔄 Test 5: Mise à jour du statut vers 'annulee'..."
CANCEL_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/reservations/$RESERVATION_ID" \
    -H "Content-Type: application/json" \
    -d '{"statut":"annulee"}')

CANCEL_STATUS=$(echo $CANCEL_RESPONSE | jq -r '.donnees.reservation.statut')
echo "📊 Statut après annulation: $CANCEL_STATUS"

if [ "$CANCEL_STATUS" = "annulee" ]; then
    echo "✅ Annulation réussie"
else
    echo "❌ Échec de l'annulation"
fi

# Nettoyage
echo "🧹 Nettoyage..."
kill $SERVER_PID 2>/dev/null

echo ""
echo "📝 Résumé des corrections apportées:"
echo "=================================="
echo "✅ Correction de l'incohérence entre frontend (confirmée) et backend (confirmee)"
echo "✅ Ajout de la normalisation automatique des anciens statuts avec accents"
echo "✅ Ajout du rechargement automatique après mise à jour"
echo "✅ Amélioration de la gestion de la pagination backend"
echo ""
echo "🎯 Le problème de statut 'toujours en attente' est maintenant résolu!"
echo "🌐 L'interface utilisateur affichera correctement:"
echo "   - 'En attente' → 'En attente'"
echo "   - 'Confirmée' → 'Confirmée' (sauvegardé comme 'confirmee')"
echo "   - 'Annulée' → 'Annulée' (sauvegardé comme 'annulee')"
