<script setup lang="ts">
interface Props {
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
  disabled: false,
  icon: false,
});

const sizeClasses = {
  sm: "h-8 px-4 text-sm",
  md: "h-10 px-8",
  lg: "h-12 px-10 text-lg",
};

const iconSizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const variantClasses = {
  default: "bg-primary text-background shadow-b shadow-primary/60 hover:opacity-90",
  secondary: "bg-foreground/10 text-foreground/70 shadow-b shadow-foreground/25 hover:bg-foreground/15 hover:text-foreground",
  outline: "border-2 border-border text-foreground hover:bg-foreground/5",
};
</script>

<template>
  <button
    class="rounded-lg font-semibold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60"
    :class="[
      icon ? iconSizeClasses[size] : sizeClasses[size],
      variantClasses[variant],
      (variant === 'default' || variant === 'secondary') && !disabled && 'active:translate-y-1 active:shadow-none',
      variant === 'outline' && !disabled && 'active:scale-95',
      icon && 'grid place-items-center',
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
