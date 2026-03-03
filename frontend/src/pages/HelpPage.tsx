import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Guide Utilisateur</h1>
        <p className="text-muted-foreground">Tout ce qu'il faut savoir pour utiliser l'application de réservation de parking.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Questions Fréquentes</CardTitle>
          <CardDescription>Trouvez rapidement des réponses à vos questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Comment réserver une place ?</AccordionTrigger>
              <AccordionContent>
                Rendez-vous sur le Dashboard, cliquez sur une place disponible (en vert) dans la carte interactive, choisissez vos dates et confirmez.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Qu'est-ce que le check-in ?</AccordionTrigger>
              <AccordionContent>
                Le jour de votre réservation, vous devez confirmer votre présence avant 11h00. Vous pouvez le faire depuis votre Dashboard via le bouton "Confirmer ma présence" ou en scannant le QR Code présent sur la place de parking.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Quelles sont les limites de réservation ?</AccordionTrigger>
              <AccordionContent>
                Les employés peuvent réserver jusqu'à 5 jours consécutifs. Les managers bénéficient d'une limite étendue à 30 jours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Comment fonctionnent les places électriques ?</AccordionTrigger>
              <AccordionContent>
                Les places électriques sont situées dans les rangées A et F. Si vous avez un véhicule électrique, cochez l'option lors de la réservation pour les filtrer facilement.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Que se passe-t-il si j'oublie de faire mon check-in ?</AccordionTrigger>
              <AccordionContent>
                Si le check-in n'est pas effectué avant 11h00 le jour J, votre réservation expire automatiquement et la place redeviendra disponible pour les autres collaborateurs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rôles et Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Employé</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Réserver des places (max 5j)</li>
                <li>Gérer ses réservations</li>
                <li>Consulter son historique</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Secrétaire</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Gérer tous les utilisateurs</li>
                <li>Annuler n'importe quelle réservation</li>
                <li>Vision globale du parking</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Manager</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Réserver des places (max 30j)</li>
                <li>Accès aux statistiques</li>
                <li>Suivi du taux d'occupation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
