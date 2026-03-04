import type { Parking } from "@/lib/types/api/Parking";
import { Api } from "../api/Api";

const PARKING_PATH = "parkings";

export class ParkingService {
  private api: Api;

  constructor({ api = new Api() }: { api?: Api } = {}) {
    this.api = api;
  }

  async findAll() {
    return this.api.request<Parking[]>({
      path: PARKING_PATH,
    });
  }
}
