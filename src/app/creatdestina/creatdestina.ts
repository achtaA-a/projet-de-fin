import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // AJOUT: RouterModule
import { DestinationService } from '../services/list-destina';

@Component({
  selector: 'app-creatdestina',
  templateUrl: './creatdestina.html',
  styleUrls: ['./creatdestina.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // AJOUT: RouterModule
  standalone: true
})
export class Creatdestina implements OnInit {
  destinationForm: FormGroup;
  chargement = false;
  erreur: string | null = null;
  succes: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  fichierImage: File | null = null;

  avionsDisponibles = [
    'A320',
    'A321',
    'A330',
    'A350',
    'B737',
    'B777',
    'B787',
    'A380',
    'Embraer 190'
  ];

  paysListe = [
    'France',
    'Espagne',
    'Italie',
    'Allemagne',
    'Royaume-Uni',
    'États-Unis',
    'Canada',
    'Maroc',
    'Tunisie',
    'Sénégal',
    "Côte d'Ivoire",
    'Cameroun',
    'Gabon',
    'Tchad',
    'Afrique du Sud',
    'Égypte',
    'Turquie',
    'Dubai',
    'Qatar',
    'Chine',
    'Japon',
    'Corée du Sud',
    'Australie',
    'Brésil'
  ];

  constructor(
    private fb: FormBuilder,
    private destinationService: DestinationService,
    private router: Router
  ) {
    this.destinationForm = this.createForm();
  }

  ngOnInit() {}

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      code: ['', [Validators.required, Validators.pattern('^[A-Z]{3}$')]],
      pays: ['', [Validators.required]],
      ville: ['', [Validators.required]],
      description: [''],
      prix: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      dureeVol: ['', [Validators.required]],
      volsParSemaine: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      avion: ['', [Validators.required]],
      'aeroport.nom': ['', [Validators.required]],
      'aeroport.code': ['', [Validators.required, Validators.pattern('^[A-Z]{3,4}$')]],
      'coordonnees.latitude': [''],
      'coordonnees.longitude': [''],
      fuseauHoraire: ['UTC+1'],
      estActif: [true]
    });
  }

  onImageSelectionnee(event: any): void {
    const fichier = event.target.files[0];
    
    if (fichier) {
      const typesValides = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!typesValides.includes(fichier.type)) {
        this.erreur = 'Veuillez sélectionner une image valide (JPEG, PNG, WebP)';
        return;
      }

      if (fichier.size > 5 * 1024 * 1024) {
        this.erreur = 'L\'image ne doit pas dépasser 5MB';
        return;
      }

      this.fichierImage = fichier;
      this.erreur = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(fichier);
    }
  }

  supprimerImage(): void {
    this.imagePreview = null;
    this.fichierImage = null;
    const input = document.getElementById('image') as HTMLInputElement;
    if (input) input.value = '';
  }

  // CORRECTION: Méthode publique pour la navigation
  annulerCreation(): void {
    this.router.navigate(['/destinations']);
  }

  onSubmit(): void {
    if (this.destinationForm.invalid) {
      this.marquerChampsCommeTouches();
      this.erreur = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    if (!this.fichierImage) {
      this.erreur = 'Veuillez sélectionner une image pour la destination';
      return;
    }

    this.chargement = true;
    this.erreur = null;
    this.succes = null;

    const formData = new FormData();
    const formValue = this.destinationForm.value;
    
    formData.append('nom', formValue.nom);
    formData.append('code', formValue.code.toUpperCase());
    formData.append('pays', formValue.pays);
    formData.append('ville', formValue.ville);
    formData.append('description', formValue.description || '');
    formData.append('prix', formValue.prix);
    formData.append('dureeVol', formValue.dureeVol);
    formData.append('volsParSemaine', formValue.volsParSemaine);
    formData.append('avion', formValue.avion);
    formData.append('fuseauHoraire', formValue.fuseauHoraire);
    formData.append('estActif', formValue.estActif.toString());
    formData.append('aeroport[nom]', formValue['aeroport.nom']);
    formData.append('aeroport[code]', formValue['aeroport.code'].toUpperCase());

    if (formValue['coordonnees.latitude']) {
      formData.append('coordonnees[latitude]', formValue['coordonnees.latitude']);
    }
    if (formValue['coordonnees.longitude']) {
      formData.append('coordonnees[longitude]', formValue['coordonnees.longitude']);
    }

    formData.append('image', this.fichierImage);

    console.log('📦 Données envoyées:', this.destinationForm.value);

    this.destinationService.creerDestination(formData).subscribe({
      next: (response) => {
        this.chargement = false;
        this.succes = 'Destination créée avec succès!';
        this.destinationForm.reset({ 
          fuseauHoraire: 'UTC+1',
          estActif: true 
        });
        this.imagePreview = null;
        this.fichierImage = null;

        setTimeout(() => {
          this.router.navigate(['/destinations']);
        }, 2000);
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Erreur lors de la création de la destination';
        console.error('Erreur création destination:', err);
        
        if (err.error?.details) {
          this.erreur += '\n' + err.error.details.join('\n');
        }
      }
    });
  }

  private marquerChampsCommeTouches(): void {
    Object.keys(this.destinationForm.controls).forEach(key => {
      this.destinationForm.get(key)?.markAsTouched();
    });
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get nom() { return this.destinationForm.get('nom'); }
  get code() { return this.destinationForm.get('code'); }
  get pays() { return this.destinationForm.get('pays'); }
  get ville() { return this.destinationForm.get('ville'); }
  get prix() { return this.destinationForm.get('prix'); }
  get dureeVol() { return this.destinationForm.get('dureeVol'); }
  get volsParSemaine() { return this.destinationForm.get('volsParSemaine'); }
  get avion() { return this.destinationForm.get('avion'); }
  get aeroportNom() { return this.destinationForm.get('aeroport.nom'); }
  get aeroportCode() { return this.destinationForm.get('aeroport.code'); }
}