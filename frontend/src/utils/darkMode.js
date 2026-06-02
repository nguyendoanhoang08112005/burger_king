export const initDarkMode = () => {
  const saved = localStorage.getItem('adminDarkMode')
  const isDark = saved === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
  return isDark
}

export const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('adminDarkMode', isDark ? 'dark' : 'light')
  return isDark
}
