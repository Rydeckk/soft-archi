import type { CreateUser, User } from "@/lib/types/api/User";
import { Api } from "../api/Api";

const USER_PATH = "users";

export class UserService {
  private api: Api;

  constructor({ api = new Api() }: { api?: Api } = {}) {
    this.api = api;
  }

  async findAll() {
    return this.api.request<User[]>({
      path: USER_PATH,
    });
  }

  async create(data: CreateUser) {
    return this.api.request<User>({
      path: USER_PATH,
      method: "POST",
      data,
    });
  }

  async delete(id: string) {
    return this.api.request<User>({
      path: `${USER_PATH}/${id}`,
      method: "DELETE",
    });
  }
}
