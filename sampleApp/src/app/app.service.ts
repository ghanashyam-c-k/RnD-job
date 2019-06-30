import { Injectable } from '@angular/core';
import { remote } from 'electron';
const dialog = remote.dialog;

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  openDialog() {
    const options: any = {
      title: 'Open file',
      properties: ['promptToCreate'],
      defaultPath: 'test.json',
      buttonLabel: 'Open',
      filters: [
        {
          name: 'JSON',
          extensions: ['json']
        }
      ]
    };
    dialog.showOpenDialog(options);
  }
}
