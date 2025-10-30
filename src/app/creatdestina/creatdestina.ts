import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DestinationService } from '../services/list-destina';

@Component({
  selector: 'app-creatdestina',
  templateUrl: './creatdestina.html',
  styleUrls: ['./creatdestina.css'],
  imports: [CommonModule, ReactiveFormsModule],
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
      prix: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      dureeVol: ['', [Validators.required]],
      volsParSemaine: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      avion: ['', [Validators.required]],
      latitude: [''],
      longitude: [''],
      estActif: [true]
    });
  }

  onImageSelectionnee(event: any): void {
    const fichier = event.target.files[0];
    
    if (fichier) {
      // Validation du type de fichier
      const typesValides = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!typesValides.includes(fichier.type)) {
        this.erreur = 'Veuillez sélectionner une image valide (JPEG, PNG, WebP)';
        return;
      }

      // Validation de la taille (max 5MB)
      if (fichier.size > 5 * 1024 * 1024) {
        this.erreur = 'L\'image ne doit pas dépasser 5MB';
        return;
      }

      this.fichierImage = fichier;
      this.erreur = null;

      // Prévisualisation de l'image
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
    
    // Ajouter les données du formulaire
    Object.keys(this.destinationForm.value).forEach(key => {
      if (this.destinationForm.value[key] !== null && this.destinationForm.value[key] !== '') {
        formData.append(key, this.destinationForm.value[key]);
      }
    });

    // Ajouter l'image
    formData.append('image', this.fichierImage);

    this.destinationService.creerDestination(formData).subscribe({
      next: (response) => {
        this.chargement = false;
        this.succes = 'Destination créée avec succès!';
        this.destinationForm.reset({ estActif: true });
        this.imagePreview = null;
        this.fichierImage = null;

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/destinations']);
        }, 2000);
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Erreur lors de la création de la destination';
        console.error('Erreur création destination:', err);
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
  get prix() { return this.destinationForm.get('prix'); }
  get dureeVol() { return this.destinationForm.get('dureeVol'); }
  get volsParSemaine() { return this.destinationForm.get('volsParSemaine'); }
  get avion() { return this.destinationForm.get('avion'); }
}