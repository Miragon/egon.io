import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import { MassNamingService } from 'src/app/Service/LabelDictionary/mass-naming.service';
import { IconDictionaryService } from '../Domain-Configuration/icon-dictionary.service';
import { WorkObjectLabelEntry } from '../../Domain/LabelDictionary/workObjectLabelEntry';
import { LabelEntry } from '../../Domain/LabelDictionary/labelEntry';

@Injectable({
  providedIn: 'root',
})
export class LabelDictionaryService {
  activityLabels: LabelEntry[] = [];
  workObjektLabels: WorkObjectLabelEntry[] = [];

  constructor(
    private massNamingService: MassNamingService,
    private elementRegistryService: ElementRegistryService,
    private iconDictionaryService: IconDictionaryService
  ) {}

  public createLabelDictionaries(): void {
    this.activityLabels = [];
    this.activityLabels = [];
    this.workObjektLabels = [];

    const allObjects = this.elementRegistryService.getAllCanvasObjects();

    allObjects.forEach((element) => {
      const name = element.businessObject.name;
      if (
        name &&
        name.length > 0 &&
        element.type.includes(elementTypes.ACTIVITY) &&
        !this.activityLabels.map((a) => a.name).includes(name)
      ) {
        this.activityLabels.push({
          name,
          originalName: name,
        });
      } else if (
        name &&
        name.length > 0 &&
        element.type.includes(elementTypes.WORKOBJECT) &&
        !this.workObjektLabels.map((e) => e.name).includes(name)
      ) {
        const iconName = element.type.replace(elementTypes.WORKOBJECT, '');
        let icon = this.iconDictionaryService.getIconSource(iconName);
        if (!icon) {
          return;
        }
        if (!icon.startsWith('data')) {
          icon = 'data:image/svg+xml,' + icon;
        }
        this.workObjektLabels.push({
          name,
          originalName: name,
          icon,
        });
      }
    });
    this.activityLabels.sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    this.workObjektLabels.sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }

  public getActivityLabels(): LabelEntry[] {
    return this.activityLabels.slice();
  }

  public getWorkObjectLabels(): WorkObjectLabelEntry[] {
    return this.workObjektLabels.slice();
  }

  public massRenameLabels(
    activityNames: string[],
    originalActivityNames: string[],
    workObjectNames: string[],
    originalWorkObjectNames: string[]
  ): void {
    for (let i = 0; i < originalActivityNames.length; i++) {
      if (!activityNames[i]) {
        activityNames[i] = '';
      }
      if (!(activityNames[i] == originalActivityNames[i])) {
        this.massNamingService.massChangeNames(
          originalActivityNames[i],
          activityNames[i],
          elementTypes.ACTIVITY
        );
      }
    }
    for (let i = 0; i < originalWorkObjectNames.length; i++) {
      if (!workObjectNames[i]) {
        workObjectNames[i] = '';
      }
      if (!(workObjectNames[i] == originalWorkObjectNames[i])) {
        this.massNamingService.massChangeNames(
          originalWorkObjectNames[i],
          workObjectNames[i],
          elementTypes.WORKOBJECT
        );
      }
    }
  }
}
