let eventBus = new Vue()

Vue.component('notes', {
       template:`
        <div class="notes">
            <create-note></create-note>
            <div class="note-list">
                <first-note></first-note>
                <second-note></second-note>
                <third-note></third-note>
            </div>
        </div>
    `,
})

Vue.component('first-note', {
    template: `
        <div class="note" >
            <h1 v-for="error in errors"> {{ error }}</h1>
            <ul>
                <li v-for="note in column_1" class="li-list">
                    <h1>{{ note.name }}</h1>
                    <h3>{{ column_1 }}</h3>
                    <h3>{{ note }}</h3>
                    <h3>{{ note.tasks }}</h3>
                    <h3>{{ note.tasks.name }}</h3>
                    <ul>
                        <li v-for="task in note.tasks" class="li-task" v-if="task !== null" >
                            <p>{{task}}</p>
                            <input type="checkbox">
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    `,

    data(){
        return{
            column_1: [],
            errors: [],
            active: 0
        }

    },
    // mounted - вызывается после того, как компонент был добавлен в DOM, т.е. србатывает после того как даннные улетели из формы сюда.
    // после чего он пытается достать и разобрать строку json из localstorage, и если ее нет, присваивает пустой массив

    mounted(){
        this.column_1 = JSON.parse(localStorage.getItem("column_1")) || [];
        eventBus.$on('notes-submitted', note => {

            this.errors = []
            if (this.column_1.length < 3){
                this.column_1.push(note);
                this.saveNote_1();
            } else {
                this.errors.push('Maximum count of tasks!');
            }
        })
    },

    // watch отслеживает изменения, если они есть, то он присваивает и сохраняет новые значения, добавляя их в localstorage и преобразовывая ('stringify') в json формат

    watch: {
        column_1(newValue) {
            localStorage.setItem("column_1", JSON.stringify(newValue));
        },
    },
    // saveNote вызывается после выполнения mounted; присваивает и сохраняет значения в localstorage, преобразовывая ('stringify') их в json формат
    methods: {
        saveNote_1(){
            localStorage.setItem('column_1', JSON.stringify(this.column_1));
        },

    }

})

Vue.component('second-note', {
    template: `
        <div class="note">
            <ul>
                <li v-for="note in column_2">
                    <p>{{ note.name }}</p>
                    <ul>
                        <li v-for="task in note.tasks" v-if="task.name !== null">
                            <p>{{task.name}}</p>
                            <input>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    `,

    data(){
        return{
            column_2: [],
            errors: [],
            active: 0
        }
    },

    mounted() {
        this.column_2 = JSON.parse(localStorage.getItem("column_2")) || [];
    },

    watch: {
        column_2(newValue) {
            localStorage.setItem("column_2", JSON.stringify(newValue));
        },
    },

    methods: {
        saveNote_2(){
            localStorage.setItem('column_2', JSON.stringify(this.column_2));
        },
    }

})

Vue.component('third-note', {
    note:{
        name:{
            type: Text,
            required: true
        },
        tasks:{
            type: Array,
            required: true,
            readiness: {
                type: Boolean,
                required: true
            }
        },
        status: {
            type: Number,
            required: true
        },
    },

    template: `
        <div class="note">
            <ul>
                <li v-for="note in column_3">
                    <p>{{ note.name }}</p>
                    <ul>
                        <li v-for="task in note.tasks" v-if="task.name !== null">
                            <p>{{task.name}}</p>
                            <input>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    `,

    data(){
        return{
            column_3: [],
            errors: [],
            active: 0
        }
    },

    mounted(){
        this.column_3 = JSON.parse(localStorage.getItem("column_3")) || [];
    },

    watch: {
        column_3(newValue) {
            localStorage.setItem("column_3", JSON.stringify(newValue));
        },
    },

    methods: {
        saveNote_3(){
            localStorage.setItem('column_3', JSON.stringify(this.column_3));
        },
    }



})

Vue.component('create-note', {
    template: `
        <div class="createNote">
            <form class="createForm" @submit.prevent="onSubmit">
                <p v-if="errors" v-for="error in errors">{{ error }}</p>
                <input type="text" placeholder="Name" id="name" v-model="name" required maxlength="10">
                <input type="text" placeholder="Task 1" id="task_1" v-model="task_1" maxlength="10">
                <input type="text" placeholder="Task 2" id="task_2" v-model="task_2" maxlength="10">
                <input type="text" placeholder="Task 3" id="task_3" v-model="task_3" maxlength="10">
                <input type="text" placeholder="Task 4" id="task_4" v-model="task_4" maxlength="10">
                <input type="text" placeholder="Task 5" id="task_5" v-model="task_5" maxlength="10">
                <button type="submit">Create</button>
            </form>
        </div>  
    `,

    data() {
        return{
            name: null,
            task_1: null,
            task_2: null,
            task_3: null,
            task_4: null,
            task_5: null,
            all_tasks: [],
            errors: []
        }
    },

    methods: {
        onSubmit() {
            this.errors = []
            this.all_tasks.push(this.task_1, this.task_2, this.task_3, this.task_4, this.task_5)
            this.all_tasks = this.all_tasks.filter(Boolean)
            if (this.all_tasks.length >= 3 ){
                let note = {
                    name: this.name,
                    tasks: {
                        task_1: this.task_1,
                        task_2: this.task_2,
                        task_3: this.task_3,
                        task_4: this.task_4,
                        task_5: this.task_5,
                    },
                    data: null,
                    сondition: 0,
                }

                eventBus.$emit('notes-submitted', note);
                eventBus.$emit('notes-poleteli', note);
                this.name = null;
                this.task_1 = null;
                this.task_2 = null;
                this.task_3 = null;
                this.task_4 = null;
                this.task_5 = null;
            }else {
                this.all_tasks = []
                if (this.errors.length === 0){
                    this.errors.push("Gabella: from 3 to 5 tasks!")
                }
            }
        },
    },
})

let app = new Vue({
    el: '#app',
    data: {
        name: 'Notes',
    }
})