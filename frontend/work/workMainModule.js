import { initializeWork } from "./work/work.jsx";
import {
    initializeWorkInteractions,
    initializeWorkScroll
} from "./work/workInteraction.jsx";

export function initializeWorkSection() {
    initializeWork();
    initializeWorkInteractions();
    initializeWorkScroll();
}