import type {
  CreateReservationRegister,
  ReservationRegister,
} from "@/lib/types/api/ReservationRegister";
import { Api } from "../api/Api";

const RESERVATION_REGISTER_PATH = "reservation-register";

export class ReservationRegisterService {
  private api: Api;

  constructor({ api = new Api() }: { api?: Api } = {}) {
    this.api = api;
  }

  async create(data: CreateReservationRegister) {
    return this.api.request<ReservationRegister>({
      path: RESERVATION_REGISTER_PATH,
      data,
      method: "POST",
    });
  }

  async findAll() {
    return this.api.request<ReservationRegister[]>({
      path: RESERVATION_REGISTER_PATH,
    });
  }

  async deleteOne(id: string) {
    return this.api.request<ReservationRegister>({
      path: `${RESERVATION_REGISTER_PATH}/${id}`,
      method: "DELETE",
    });
  }
}
