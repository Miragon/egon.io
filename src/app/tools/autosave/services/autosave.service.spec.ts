import { TestBed } from '@angular/core/testing';

import { AutosaveService } from './autosave.service';
import { MockProviders } from 'ng-mocks';
import { ModelerService } from '../../modeler/services/modeler.service';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { ExportService } from '../../export/services/export.service';
import { AutosaveConfigurationService } from './autosave-configuration.service';
import { Draft } from '../domain/draft';
import { testConfigAndDst } from '../../export/domain/export/configAndDst';
import { StorageService } from '../../../domain/services/storage.service';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DRAFTS_KEY } from 'src/app/domain/entities/constants';

describe('AutosaveService', () => {
  let service: AutosaveService;

  let modelerServiceSpy: jasmine.SpyObj<ModelerService>;
  let autosaveStateSpy: jasmine.SpyObj<AutosaveConfigurationService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let iconSetImportExportService: jasmine.SpyObj<IconSetImportExportService>;

  beforeEach(() => {
    const modelerServiceMock = jasmine.createSpyObj(ModelerService.name, [
      'importStory',
      'getStory',
    ]);
    const autosaveConfigurationServiceMock = jasmine.createSpyObj(
      AutosaveConfigurationService.name,
      ['setConfiguration'],
      { configuration$: of({ activated: true, maxDrafts: 1, interval: 1 }) },
    );
    const storageServiceMock = jasmine.createSpyObj(StorageService.name, [
      'get',
      'set',
    ]);
    const iconSetImportExportServiceMock = jasmine.createSpyObj(
      IconSetImportExportService.name,
      ['createIconSetConfiguration'],
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModelerService,
          useValue: modelerServiceMock,
        },
        {
          provide: AutosaveConfigurationService,
          useValue: autosaveConfigurationServiceMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
        {
          provide: IconSetImportExportService,
          useValue: iconSetImportExportServiceMock,
        },
        MockProviders(ExportService, MatSnackBar),
      ],
    });
    modelerServiceSpy = TestBed.inject(
      ModelerService,
    ) as jasmine.SpyObj<ModelerService>;
    autosaveStateSpy = TestBed.inject(
      AutosaveConfigurationService,
    ) as jasmine.SpyObj<AutosaveConfigurationService>;
    storageServiceSpy = TestBed.inject(
      StorageService,
    ) as jasmine.SpyObj<StorageService>;
    iconSetImportExportService = TestBed.inject(
      IconSetImportExportService,
    ) as jasmine.SpyObj<IconSetImportExportService>;

    service = TestBed.inject(AutosaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadDraft', () => {
    beforeEach(() => {
      modelerServiceSpy.importStory.and.returnValue();
    });

    it('should call ModelerService.importStory', () => {
      service.loadDraft(createDraft(Date.now().toString().slice(0, 25)));
      expect(modelerServiceSpy.importStory).toHaveBeenCalled();
    });
  });

  describe('getDrafts', () => {
    let drafts: Draft[] = [];

    beforeEach(() => {
      drafts = [
        createDraft(Date.UTC(2000, 1, 1, 1, 1, 1).toString().slice(0, 25)),
        createDraft(Date.now().toString().slice(0, 25)),
      ];
    });

    it('should getItem from local Storage', () => {
      storageServiceSpy.get.withArgs(DRAFTS_KEY).and.returnValue([]);
      const loadedDrafts = service.getDrafts();

      expect(storageServiceSpy.get).toHaveBeenCalledWith(DRAFTS_KEY);
      expect(loadedDrafts).toEqual([]);
    });

    it('should return sorted drafts', () => {
      storageServiceSpy.get.withArgs(DRAFTS_KEY).and.returnValue(drafts);

      const loadedDrafts = service.getDrafts();

      expect(storageServiceSpy.get).toHaveBeenCalledWith(DRAFTS_KEY);
      expect(loadedDrafts).toEqual(drafts);
    });
  });

  function createDraft(date: string): Draft {
    return {
      description: 'desc',
      title: 'title',
      configAndDST: structuredClone(testConfigAndDst),
      date,
    };
  }
});
