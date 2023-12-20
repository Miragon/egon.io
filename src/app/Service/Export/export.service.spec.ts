import { TestBed } from '@angular/core/testing';

import { ExportService } from 'src/app/Service/Export/export.service';
import { HtmlPresentationService } from './html-presentation.service';
import { MockService } from 'ng-mocks';
import { DomainConfigurationService } from '../DomainConfiguration/domain-configuration.service';
import { PngService } from './png.service';
import { SvgService } from './svg.service';
import { RendererService } from '../Renderer/renderer.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HtmlPresentationService,
          useValue: MockService(HtmlPresentationService),
        },
        {
          provide: DomainConfigurationService,
          useValue: MockService(DomainConfigurationService),
        },
        {
          provide: PngService,
          useValue: MockService(PngService),
        },
        {
          provide: SvgService,
          useValue: MockService(SvgService),
        },
        {
          provide: RendererService,
          useValue: MockService(RendererService),
        },
      ],
    });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
