import { Controller, Get, UseGuards, Request } from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { DashboardService } from "./dashboard.service"

@Controller("dashboard")
export class DashboardController {

  constructor(
    private dashboardService: DashboardService
  ){}

  @UseGuards(JwtAuthGuard)
  @Get("analytics")
  getAnalytics(@Request() req){

    const workspaceId = req.headers["workspaceid"]

    return this.dashboardService.getAnalytics(
      workspaceId
    )

  }

}