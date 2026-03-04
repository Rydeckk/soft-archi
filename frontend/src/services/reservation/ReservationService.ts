import type {
  CreateReservation,
  Reservation,
  UpdateReservation,
} from "@/lib/types/api/Reservation";
import { Api } from "../api/Api";

const RESERVATION_PATH = "reservations";

export class ReservationService {
  private api: Api;

  constructor({ api = new Api() }: { api?: Api } = {}) {
    this.api = api;
  }

  async create(data: CreateReservation) {
    return this.api.request<Reservation>({
      path: RESERVATION_PATH,
      data,
      method: "POST",
    });
  }

  async findAll() {
    return this.api.request<Reservation[]>({
      path: RESERVATION_PATH,
    });
  }

  async updateOne(id: string, data: UpdateReservation) {
    return this.api.request<Reservation>({
      path: `${RESERVATION_PATH}/${id}`,
      data,
      method: "PATCH",
    });
  }

  async deleteOne(id: string) {
    return this.api.request<Reservation>({
      path: `${RESERVATION_PATH}/${id}`,
      method: "DELETE",
    });
  }
}
