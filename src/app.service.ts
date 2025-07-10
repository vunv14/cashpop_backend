import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello() {
    return { message: "CashPop API is running!" };
  }
}
