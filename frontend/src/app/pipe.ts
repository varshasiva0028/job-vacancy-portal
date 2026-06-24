import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchKeyword: string): any[] {

    if (!items) {
      return [];
    }

    if (!searchKeyword || searchKeyword.trim() === '') {
      return items;
    }

    const search = searchKeyword.toLowerCase().trim();

    return items.filter(item => {
      const name = item.name?.toLowerCase() || '';

      return name.startsWith(search);
    });

  }

}