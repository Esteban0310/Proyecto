// src/test.ts
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Inicializa el entorno de test de Angular
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Carga automáticamente todos los archivos *.spec.ts dentro de src/app/
const context = (require as any).context('./app/', true, /\.spec\.ts$/);
context.keys().map(context);
