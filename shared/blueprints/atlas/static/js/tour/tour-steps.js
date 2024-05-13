import "./shepherd.js";
//import "/atlas/atlas/static/js/tour/shepherd.js";

document.addEventListener('DOMContentLoaded', function() {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            classes: 'class-1 class-2',
            scrollTo: { behavior: 'smooth', block: 'center' }
        }
    });

    tour.addStep({
        title: 'Rondleiding nodig?',
        text: `
            <p>Welkom op de Digitale Tweeling van jouw gemeente! Hier leggen we in een paar stappen uit wat er te vinden is.</p>
            <p>Mocht je vastlopen, ververs dan de pagina (sneltoets F5) om naar de eerste weergave terug te gaan.</p>
            <p>Klik hier voor het instructiefilmpje hoe de website te gebruiken.</p>
            <p>Gebruik de knop 'volgende' om de rondleiding te starten.</p>
            <p>Liever zelf ontdekken? Klik dan op 'Sluiten.'</p>
        `,
        buttons: [
            {
                action() {
                    localStorage.setItem('general_tour', 'done');
                    return this.complete();
                },
                classes: 'shepherd-button-secondary',
                text: 'Sluiten'
            },
            {
                action() {
                    return this.next();
                },
                text: 'Volgende'
            }
        ],
        id: 'creating'
    });
    tour.addStep({
        title: 'Kaartlagen',
        text: `
            <p>Hier kan je adressen in jouw gemeente opzoeken en lagen toevoegen of verbergen.</br>
                De lagen staan onder de thema's: klik op de thema's om de onderliggende lagen zichtbaar te maken.</p>
            <p>Kijk bijvoorbeeld eens onder 'wonen' naar gegevens over je eigen buurt!</p>
        `,
        attachTo: {
            element: '#sidepanel',
            on: 'right',
            arrow: true
        },
        buttons: [
            {
                action() {
                    localStorage.setItem('general_tour', 'done');
                    return this.complete();;
                },
                classes: 'shepherd-button-secondary',
                text: 'Sluiten'
            },
            {
                action() {
                    return this.back();
                },
                classes: 'shepherd-button-secondary',
                text: 'Vorige'
            },
            {
                action() {
                    return this.next();
                },
                text: 'Volgende'
            }
        ],
        id: 'creating'
    });
    tour.addStep({
        title: 'Zijpaneel bediening',
        text: `
            <p>Met dit pijltje kan je het menu in- en uitklappen, zo heb je meer ruimte op de kaart.</p>
        `,
        attachTo: {
            element: '#map-sidepanel-btn',
            on: 'right',
            arrow: true
        },
        buttons: [
            {
                action() {
                    localStorage.setItem('general_tour', 'done');
                    return this.complete();;
                },
                classes: 'shepherd-button-secondary',
                text: 'Sluiten'
            },
            {
                action() {
                    return this.back();
                },
                classes: 'shepherd-button-secondary',
                text: 'Vorige'
            },
            {
                action() {
                    return this.next();
                },
                text: 'Volgende'
            }
        ],
        id: 'creating'
    });
    tour.addStep({
        title: 'Legenda en kaartlaag informatie',
        text: `
            <p>Met deze knoppen kun je de legenda en beschikbare informatie bekijken die betrekking hebben op de geselecteerde kaartlaag</p>
        `,
        attachTo: {
            element: '#legend-sidepanel-btn',
            on: 'left',
            arrow: true
        },
        buttons: [
            {
                action() {
                    localStorage.setItem('general_tour', 'done');
                    return this.complete();;
                },
                classes: 'shepherd-button-secondary',
                text: 'Sluiten'
            },
            {
                action() {
                    return this.back();
                },
                classes: 'shepherd-button-secondary',
                text: 'Vorige'
            },
            {
                action() {
                    return this.next();
                },
                text: 'Volgende'
            }
        ],
        id: 'creating'
    });
    tour.addStep({
        title: 'Kaart navigatie',
        text: `
            <p>Met deze knoppen kan de achtergrondkaart worden aangepast en over de kaart worden genavigeerd (in- en uitzoomen, draaien en kantelen).</p> 
            <p>Navigeren kan ook met de muis (scrollen, klikken en slepen naar links of rechts), toetsenbord (klik eerst de kaart aan en gebruik dan de pijltjestoetsen) of een touchpad (klikken en slepen, gebruik twee vingers).</p>
        `,
        attachTo: {
            element: '#map_controls_maptype',
            on: 'left',
            arrow: true
        },
        buttons: [
            {
                action() {
                    localStorage.setItem('general_tour', 'done');
                    return this.complete();;
                },
                classes: 'shepherd-button-secondary',
                text: 'Sluiten'
            },
            {
                action() {
                    return this.back();
                },
                classes: 'shepherd-button-secondary',
                text: 'Vorige'
            },
            {
                action() {
                    return this.next();
                },
                text: 'Volgende'
            }
        ],
        id: 'creating'
    });
    tour.addStep({
        title: 'Einde rondleiding',
        text: `
            <p>Dit is het einde van de rondleiding. Klik op de knop rondleiding in het menu links om de tour later opnieuw te starten.</p>
            <p>Meer hulp is te vinden via ‘Veelgestelde vragen’ en ‘Contact’ (bovenin).</p>
        `,
        buttons: [
            {
                action() {
                    return this.back();
                },
                classes: 'shepherd-button-secondary',
                text: 'Vorige'
            },
            {
                action() {
                    localStorage.setItem('general_tour', 'done');
                    return this.complete();;
                },
                text: 'Sluiten'
            },
        ],
        id: 'creating'
    });

    if(localStorage.getItem('general_tour') !== 'done' && document.getElementById('tourStart')) {
        tour.start();
    }

    if(document.getElementById('tourStart')){
        document.getElementById('tourStart').addEventListener('click',function(){
            tour.start();
        });
    }
}
, false);