import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }

    const lowerSearchText = searchText.toLowerCase();

    return items.filter(item => {
      return Object.keys(item).some(key => {
        const val = item[key];
        if (val === null || val === undefined) {
          return false;
        }
        return String(val).toLowerCase().includes(lowerSearchText);
      });
    });
  }
}
