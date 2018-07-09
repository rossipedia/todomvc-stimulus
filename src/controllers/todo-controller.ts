import { Controller, Application } from 'stimulus';
import TodoItemController from './todoitem-controller';
import { access } from 'fs';

function waitForController(app: Application, element: Element, id: string) {
    return new Promise<Controller>(resolve => {
        const check = () => {
            const ctrl = app.getControllerForElementAndIdentifier(element, id);
            if (!!ctrl) resolve(ctrl);
            else setTimeout(check);
        };

        check();
    });
}

type HashValues = '#/' | '#/active' | '#/completed';

export default class TodoController extends Controller {
    static targets: string[] = [
        'newTodo',
        'itemTemplate',
        'items',
        'activeCount',
        'activeCountPluralize',
        'filters',
        'footer',
    ];

    newTodoTarget: HTMLInputElement;
    itemTemplateTarget: HTMLTemplateElement;
    itemsTarget: HTMLUListElement;

    activeCountTarget: HTMLElement;
    activeCountPluralizeTarget: HTMLElement;

    filtersTarget: HTMLUListElement;
    footerTarget: HTMLElement;

    connect() {
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.updateCount();
        this.handleHashChange();
    }

    handleHashChange() {
        const validateHash: () => HashValues = () => {
            switch (location.hash) {
                case '':
                case '#/':
                    return '#/';
                case '#/active':
                case '#/completed':
                    return location.hash;
                default:
                    return undefined;
            }
        };

        const setSelectedFilter = hash => {
            Array.from(this.filtersTarget.children).forEach(
                (li: HTMLLIElement) => {
                    const a = li.querySelector('a');
                    a.classList.toggle('selected', a.hash === hash);
                },
            );
        };

        const setVisibleItems = (hash: HashValues) => {
            this.forEachTodo(
                {
                    '#/': todo => {
                        todo.visible = true;
                    },
                    '#/active': todo => {
                        todo.visible = !todo.completed;
                    },
                    '#/completed': todo => {
                        todo.visible = todo.completed;
                    },
                }[hash],
            );
        };

        let hash = validateHash();
        if (!hash) {
            history.pushState({}, undefined, '#/');
            return;
        }

        setSelectedFilter(hash);
        setVisibleItems(hash);
    }

    get newTodo() {
        return this.newTodoTarget.value.trim();
    }

    set newTodo(v) {
        this.newTodoTarget.value = (v && v.trim()) || '';
    }

    newTodoKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (this.newTodo !== '') {
                    this.addNewTodo();
                }
                break;
        }
    }

    async addNewTodo() {
        const tpl = document.importNode(this.itemTemplateTarget, true).content;
        // Needs to be here before the appendChild because nodes move from
        // tpl to this.itemsTarget
        const itemElement = tpl.querySelector('[data-controller="todoitem"]');
        this.itemsTarget.appendChild(tpl);
        const childController = (await waitForController(
            this.application,
            itemElement,
            'todoitem',
        )) as TodoItemController;

        childController.value = this.newTodo;
        this.newTodo = '';
        this.updateCount();
    }

    get activeCount() {
        return this.reduceTodos((c, todo) => c + (todo.completed ? 0 : 1), 0);
    }

    get todoCount() {
        return this.reduceTodos((c, todo) => c + 1, 0);
    }

    updateCount() {
        const { activeCount } = this;
        this.activeCountTarget.textContent = activeCount.toString();
        this.activeCountPluralizeTarget.textContent =
            activeCount === 1 ? '' : 's';

        const { todoCount } = this;
        this.footerTarget.classList.toggle('hidden', todoCount === 0);
    }

    toggleAll() {
        this.forEachTodo(todo => {
            todo.completed = true;
        });
    }

    clearCompleted() {
        // Get snapshot before we start clearing things out
        const todos = Array.from(this.allTodos());
        todos.forEach(todo => {
            if (todo.completed) {
                todo.destroy();
            }
        });
    }

    *allTodos() {
        for (const child of this.itemsTarget.children) {
            const ctrl = this.application.getControllerForElementAndIdentifier(
                child,
                'todoitem',
            ) as TodoItemController;
            if (ctrl) yield ctrl;
        }
    }

    reduceTodos<T>(
        reducer: (acc: T, todo: TodoItemController) => T,
        initial: T,
    ): T {
        for (const todo of this.allTodos()) initial = reducer(initial, todo);
        return initial;
    }

    forEachTodo(handler: (ctrl: TodoItemController) => void) {
        for (const todo of this.allTodos()) handler(todo);
    }
}
