import { Controller, Get, Query, Request, UseGuards, BadRequestException } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchDto } from './dto/search.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('search')
export class SearchController {

  constructor(private searchService: SearchService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  search(@Query() dto: SearchDto, @Request() req) {
    const workspaceId = req.headers['workspaceid']

    if (!workspaceId) {
      throw new BadRequestException('workspaceid header is required.')
    }

    return this.searchService.search(dto.q, workspaceId, dto.type, dto.limit)
  }
}
