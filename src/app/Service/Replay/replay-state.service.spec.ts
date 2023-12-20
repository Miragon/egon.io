import { TestBed } from '@angular/core/testing';

import { ReplayStateService } from 'src/app/Service/Replay/replay-state.service';

describe('ReplayStateService', () => {
  let service: ReplayStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplayStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return value', () => {
    expect(service.getReplayOn()).toBeFalse();
  });

  it('should return Observable', () => {
    service.replayOn$.subscribe((value) => expect(value).toBeFalse());
  });

  it('should set value', () => {
    service.setReplayState(true);
    expect(service.getReplayOn()).toBeTrue();
  });
});
