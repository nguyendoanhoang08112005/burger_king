import { GenericCrudPage, crudPages } from '../../components/admin/GenericCrud'

export default function AdminCategoriesPage() {
  return <GenericCrudPage {...crudPages.categories} />
}
