import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosavedDraftsComponent } from './autosaved-drafts.component';
import { MockModule, MockProviders, MockService } from 'ng-mocks';
import { AutosaveService } from '../../../Service/Autosave/autosave.service';
import { AutosaveConfigurationService } from '../../../Service/Autosave/autosave-configuration.service';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

describe('AutosavedDraftsComponent', () => {
  let component: AutosavedDraftsComponent;
  let fixture: ComponentFixture<AutosavedDraftsComponent>;
  let autosaveServiceSpy: jasmine.SpyObj<AutosaveService>;

  const autosaveConfigurationServiceMock = jasmine.createSpyObj(
    'AutosaveConfigurationService',
    ['setConfiguration'],
    { configuration$: of({ activated: true, amount: 1, interval: 1 }) }
  );

  const autosaveServiceMock = jasmine.createSpyObj(
    'AutosaveService',
    ['loadCurrentDrafts', 'loadDraft', 'removeAllDrafts'],
    { autosavedDraftsChanged$: of() }
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [AutosavedDraftsComponent],
      providers: [
        {
          provide: AutosaveService,
          useValue: autosaveServiceMock,
        },
        {
          provide: AutosaveConfigurationService,
          useValue: autosaveConfigurationServiceMock,
        },
        MockProviders(MatSnackBar),
      ],
    }).compileComponents();

    autosaveServiceSpy = TestBed.inject(
      AutosaveService
    ) as jasmine.SpyObj<AutosaveService>;
    autosaveServiceSpy.loadCurrentDrafts.and.returnValue([]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosavedDraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
