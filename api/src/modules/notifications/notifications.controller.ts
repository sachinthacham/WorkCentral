import {
Controller,
Get,
Patch,
Param,
UseGuards,
Request,
Query,
} from "@nestjs/common"

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { NotificationsService } from "./notifications.service"
import { PaginationDto } from "../../common/dto/pagination.dto"

@Controller("notifications")
export class NotificationsController {

  constructor(
    private notificationsService: NotificationsService
  ){}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyNotifications(@Request() req, @Query() pagination: PaginationDto) {
    return this.notificationsService.getUserNotifications(
      req.user.userId,
      pagination.page,
      pagination.limit,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/read")
  markAsRead(@Param("id") id:string){

    return this.notificationsService.markAsRead(id)

  }

}