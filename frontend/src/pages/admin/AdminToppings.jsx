import { GenericCrudPage, crudPages } from '../../components/admin/GenericCrud'

export default function AdminToppingsPage({ categories }) {
  return <GenericCrudPage {...crudPages.toppings} categories={categories} />
}
