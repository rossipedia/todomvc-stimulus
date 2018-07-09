import { Controller } from 'stimulus';

export default class TodoItemController extends Controller {
    static targets: string[] = ['valueLabel', 'valueEditor', 'completed'];

    valueLabelTarget: HTMLLabelElement;
    valueEditorTarget: HTMLInputElement;
    completedTarget: HTMLInputElement;

    connect() {
        // sync up the 'complete' class and the checkbox state
        if (this.completedTarget.checked) {
            this.completed = true;
        } else if (this.completed) {
            this.completedTarget.checked = true;
        }
    }

    get visible() {
        return this.element.classList.contains('hidden');
    }

    set visible(value:boolean) {
        this.element.classList.toggle('hidden', value);
    }

    get value() {
        if (this.editing) {
            return this.valueEditorTarget.value.trim();
        } else {
            return this.valueLabelTarget.textContent.trim();
        }
    }

    set value(v) {
        this.valueEditorTarget.value = this.valueLabelTarget.textContent =
            (v && v.trim()) || '';
    }

    get editing() {
        return this.element.classList.contains('editing');
    }

    set editing(value: boolean) {
        this.element.classList.toggle('editing', value);
        if (value) {
            this.valueEditorTarget.focus();
        }
    }

    edit() {
        this.editing = true;
    }

    unedit() {
        this.editing = false;
    }

    get completed() {
        return this.element.classList.contains('completed');
    }

    set completed(value: boolean) {
        this.element.classList.toggle('completed', value);
        this.element.dispatchEvent(new CustomEvent('itemchanged'));
    }

    toggleCompleted() {
        this.completed = !this.completed;
    }

    destroy() {
        const {parentElement} = this.element;
        this.element.remove();
        parentElement.dispatchEvent(new CustomEvent('itemdestroyed'));
    }
}
