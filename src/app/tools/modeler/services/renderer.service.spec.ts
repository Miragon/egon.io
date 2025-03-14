import { TestBed } from '@angular/core/testing';
import { RendererService } from './renderer.service';
import { ModelerService } from './modeler.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { DirtyFlagService } from '../../../domain/services/dirty-flag.service';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { IconSet } from '../../../domain/entities/iconSet';

describe('RendererService', () => {
  let service: RendererService;

  let modelerServiceSpy: jasmine.SpyObj<ModelerService>;
  let elementRegistryServiceSpy: jasmine.SpyObj<ElementRegistryService>;
  let dirtyFlagServiceSpy: jasmine.SpyObj<DirtyFlagService>;

  beforeEach(() => {
    const modelerServiceMock = jasmine.createSpyObj('ModelerService', [
      'getModeler',
      'restart',
      'commandStackChanged',
      'startDebounce',
      'fitStoryToScreen',
    ]);
    const elementRegistryServiceMock = jasmine.createSpyObj(
      'ElementRegistryService',
      ['correctInitialize', 'createObjectListForDSTDownload'],
    );
    const dirtyFlagServiceMock = jasmine.createSpyObj('DirtyFlagService', [
      'makeClean',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModelerService,
          useValue: modelerServiceMock,
        },
        {
          provide: ElementRegistryService,
          useValue: elementRegistryServiceMock,
        },
        {
          provide: DirtyFlagService,
          useValue: dirtyFlagServiceMock,
        },
      ],
    });
    modelerServiceSpy = TestBed.inject(
      ModelerService,
    ) as jasmine.SpyObj<ModelerService>;
    elementRegistryServiceSpy = TestBed.inject(
      ElementRegistryService,
    ) as jasmine.SpyObj<ElementRegistryService>;
    dirtyFlagServiceSpy = TestBed.inject(
      DirtyFlagService,
    ) as jasmine.SpyObj<DirtyFlagService>;
    service = TestBed.inject(RendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('importStory', () => {
    const iconSetConfig: IconSet = {
      name: 'test',
      actors: new Dictionary(),
      workObjects: new Dictionary(),
    };

    beforeEach(() => {
      modelerServiceSpy.getModeler.and.returnValue({
        importBusinessObjects: (story: any) => {},
      });
      modelerServiceSpy.restart.and.returnValue();
      elementRegistryServiceSpy.correctInitialize.and.returnValue();
      modelerServiceSpy.commandStackChanged.and.returnValue();
      modelerServiceSpy.startDebounce.and.returnValue();
      dirtyFlagServiceSpy.makeClean.and.returnValue();
    });

    it('should call correct functions - makeClean', () => {
      service.importStory([], iconSetConfig);

      expect(modelerServiceSpy.restart).toHaveBeenCalled();
      expect(elementRegistryServiceSpy.correctInitialize).toHaveBeenCalledTimes(
        1,
      );
      expect(modelerServiceSpy.commandStackChanged).toHaveBeenCalledTimes(1);
      expect(modelerServiceSpy.startDebounce).toHaveBeenCalledTimes(1);
      expect(dirtyFlagServiceSpy.makeClean).toHaveBeenCalled();
    });

    it('should call correct functions - not makeClean', () => {
      service.importStory([], iconSetConfig, false);

      expect(modelerServiceSpy.restart).toHaveBeenCalled();
      expect(elementRegistryServiceSpy.correctInitialize).toHaveBeenCalledTimes(
        1,
      );
      expect(modelerServiceSpy.commandStackChanged).toHaveBeenCalledTimes(1);
      expect(modelerServiceSpy.startDebounce).toHaveBeenCalledTimes(1);
      expect(dirtyFlagServiceSpy.makeClean).toHaveBeenCalledTimes(0);
    });

    it('should call correct functions - makeClean', () => {
      service.importStory([]);

      expect(modelerServiceSpy.getModeler).toHaveBeenCalled();
      expect(modelerServiceSpy.restart).toHaveBeenCalledTimes(1);
      expect(elementRegistryServiceSpy.correctInitialize).toHaveBeenCalled();
      expect(modelerServiceSpy.commandStackChanged).toHaveBeenCalled();
      expect(modelerServiceSpy.startDebounce).toHaveBeenCalled();
      expect(dirtyFlagServiceSpy.makeClean).toHaveBeenCalled();
    });
  });

  describe('getStory', () => {
    it('should call createObjectListForDSTDownload', () => {
      elementRegistryServiceSpy.createObjectListForDSTDownload.and.returnValue(
        [],
      );
      service.getStory();
      expect(
        elementRegistryServiceSpy.createObjectListForDSTDownload,
      ).toHaveBeenCalled();
    });
  });
});
