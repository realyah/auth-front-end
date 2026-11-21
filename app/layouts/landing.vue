<!-- Full-width layout for marketing-style pages (sections control their own width). -->
<template>
  <div class="flex min-h-screen flex-col bg-slate-950">
    <LayoutAppHeader />
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
