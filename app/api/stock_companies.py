import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_index import StockIndexRepository
from dto.stock_company_dto import StockCompanyCreateDTO, StockCompanyDTO
from services.stock_company_sync import StockCompanySyncService

router = APIRouter(prefix="/api/stock-companies", tags=["stock-companies"])


def get_sync_service(
    db: AsyncSession = Depends(get_session),
) -> StockCompanySyncService:
    return StockCompanySyncService(db)


def get_company_repo(
    db: AsyncSession = Depends(get_session),
) -> StockCompanyRepository:
    return StockCompanyRepository(db)


def get_index_repo(
    db: AsyncSession = Depends(get_session),
) -> StockIndexRepository:
    return StockIndexRepository(db)


@router.get("/", response_model=list[StockCompanyDTO])
async def get_all_companies(
    repo: StockCompanyRepository = Depends(get_company_repo),
):
    return await repo.get_all()


@router.get("/count")
async def get_companies_count(
    repo: StockCompanyRepository = Depends(get_company_repo),
):
    count = await repo.get_count()
    return {"count": count}


@router.get("/{company_id}", response_model=StockCompanyDTO)
async def get_company(
    company_id: int,
    repo: StockCompanyRepository = Depends(get_company_repo),
):
    company = await repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return StockCompanyDTO.model_validate(company)


@router.post("/", response_model=StockCompanyDTO, status_code=201)
async def create_company(
    data: StockCompanyCreateDTO,
    service: StockCompanySyncService = Depends(get_sync_service),
):
    try:
        return await service.add_single_company(data.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.put("/{company_id}", response_model=StockCompanyDTO)
async def update_company(
    company_id: int,
    data: StockCompanyCreateDTO,
    repo: StockCompanyRepository = Depends(get_company_repo),
):
    company = await repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company.symbol = data.symbol
    company.yahoo_symbol = data.yahoo_symbol
    company.name = data.name
    company.exchange_id = data.stock_exchange_id
    company.active = data.active

    await repo.save()
    return StockCompanyDTO.model_validate(company)


@router.delete("/{company_id}", status_code=204)
async def delete_company(
    company_id: int,
    repo: StockCompanyRepository = Depends(get_company_repo),
):
    company = await repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    await repo.delete(company)
    await repo.save()


@router.get("/exchange/{exchange_symbol}", response_model=list[StockCompanyDTO])
async def get_companies_by_exchange(
    exchange_symbol: str,
    service: StockCompanySyncService = Depends(get_sync_service),
):
    return await service.get_companies_by_exchange(exchange_symbol)


@router.get("/index/{index_symbol}", response_model=list[StockCompanyDTO])
async def get_companies_by_index(
    index_symbol: str,
    service: StockCompanySyncService = Depends(get_sync_service),
):
    return await service.get_companies_by_index(index_symbol)


@router.post("/import/json")
async def import_from_json(
    file: UploadFile = File(...),
    service: StockCompanySyncService = Depends(get_sync_service),
):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="File must be JSON")

    content = await file.read()
    with tempfile.NamedTemporaryFile(mode="wb", suffix=".json", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        count = await service.sync_from_json_file(tmp_path)
        return {"imported": count}
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@router.post("/import/yaml")
async def import_from_yaml(
    file: UploadFile = File(...),
    service: StockCompanySyncService = Depends(get_sync_service),
):
    if not file.filename.endswith((".yaml", ".yml")):
        raise HTTPException(status_code=400, detail="File must be YAML")

    content = await file.read()
    with tempfile.NamedTemporaryFile(mode="wb", suffix=".yaml", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        count = await service.sync_from_yaml_file(tmp_path)
        return {"imported": count}
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@router.post("/index/{index_symbol}/companies")
async def add_companies_to_index(
    index_symbol: str,
    company_symbols: list[str],
    service: StockCompanySyncService = Depends(get_sync_service),
):
    try:
        count = await service.add_companies_to_index(index_symbol, company_symbols)
        return {"added": count}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/index/{index_symbol}/companies")
async def remove_companies_from_index(
    index_symbol: str,
    company_symbols: list[str],
    service: StockCompanySyncService = Depends(get_sync_service),
):
    try:
        count = await service.remove_companies_from_index(index_symbol, company_symbols)
        return {"removed": count}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
