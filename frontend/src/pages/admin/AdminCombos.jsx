import { GenericCrudPage, crudPages } from '../../components/admin/GenericCrud'

export default function AdminCombosPage({ products }) {
  return <GenericCrudPage {...crudPages.combos} products={products} />
}
