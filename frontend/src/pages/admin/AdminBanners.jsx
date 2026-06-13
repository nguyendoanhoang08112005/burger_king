import { GenericCrudPage, crudPages } from '../../components/admin/GenericCrud'

export default function AdminBannersPage() {
  return <GenericCrudPage {...crudPages.banners} />
}
