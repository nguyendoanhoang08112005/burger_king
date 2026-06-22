import { GenericCrudPage, crudPages } from '../../components/admin/GenericCrud'

export default function AdminBranchesPage() {
  return <GenericCrudPage {...crudPages.branches} />
}
