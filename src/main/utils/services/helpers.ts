import { LeanService } from '../../types/models/Service';
import { escapeVersion } from '../helpers';

function resetEscapeVersionInService(service: LeanService): void {
  for (const version in service.activePricings) {
    const formattedVersion = escapeVersion(version);

    service.activePricings[formattedVersion] = {
      ...service.activePricings[version],
    };

    delete service.activePricings[version];
  }

  for (const version in service.archivedPricings) {
    const formattedVersion = escapeVersion(version);

    service.archivedPricings[formattedVersion] = {
      ...service.archivedPricings[version],
    };

    delete service.archivedPricings[version];
  }
}

export { resetEscapeVersionInService };
