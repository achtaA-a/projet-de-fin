import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Format attendu: 'PT2H30M' ou '2h 30m' ou '2h30m'
    const matches = value.match(/PT?(\d+)H?(\d*)M?/i) || [];
    
    if (matches.length >= 3) {
      const hours = parseInt(matches[1]) || 0;
      const minutes = parseInt(matches[2]) || 0;
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      }
    }
    
    // Si le format n'est pas reconnu, retourner la valeur d'origine
    return value;
  }
}
