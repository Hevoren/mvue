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
                    <ul>
                        <li v-for="task in note.tasks" class="li-task" v-if="task.name !== null">
                            <p>{{task.name}}</p>
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
                this.errors.push('Maximum number of tasks!');
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
        newStatus_1(note, task) {
            task.readiness = true;
            let count = 0;
            note.status = 0;
            for (let i = 0; i < 5; ++i) {
                if (note.tasks[i].name != null) {
                    count++;
                }
            }
            for (let i = 0; i < count; ++i) {
                if (note.tasks[i].readiness === true) {
                    note.status++;
                }
            }
            if (note.status/count*100 >= 50 && this.column_2.length < 5) {
                this.column_2.push(note)
                this.column_1.splice(this.column_1.indexOf(note), 1)
            } else if (this.column_2.length === 5) {
                if(this.column_1.length > 0) {
                    this.column_1.forEach(item => {
                        item.tasks.forEach(item => {
                            item.readiness = true;
                        })
                    })
                }
            }
            this.saveNote_2();
        },
        newStatus_2(note, task) {
            task.readiness = true;
            let count = 0;
            note.status = 0;
            for (let i = 0; i < 5; ++i) {
                if (note.tasks[i].name != null) {
                    count++;
                }
            }
            for (let i = 0; i < count; ++i) {
                if (note.tasks[i].readiness === true) {
                    note.status++;
                }
            }
            if (note.status/count*100 === 100) {
                this.column_3.push(note)
                this.column_2.splice(this.column_2.indexOf(note), 1)
                note.date = new Date()
            }
            if(this.column_2.length < 5) {
                if(this.column_1.length > 0) {
                    this.column_1.forEach(item => {
                        item.tasks.forEach(item => {
                            item.readiness = false;
                        })
                    })
                }
            }
            this.saveNote_3();
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

    methods: {
        saveNote_2(){
            localStorage.setItem('colum_2', JSON.stringify(this.colum_2));
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



})

Vue.component('create-note', {
    template: `
        <div class="createNote">
            <form class="createForm" @submit.prevent="onSubmit">
                <input type="text" placeholder="Name" id="name" v-model="name" required maxlength="10">
                <input type="text" placeholder="Task 1" id="task_1" v-model="task_1" maxlength="10">
                <input type="text" placeholder="Task 2" id="task_2" v-model="task_2" maxlength="10">
                <input type="text" placeholder="Task 3" id="task_3" v-model="task_3" maxlength="10">
                <input type="text" placeholder="Task 4" id="task_4" v-model="task_4">
                <input type="text" placeholder="Task 5" id="task_5" v-model="task_5">
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
            all_tasks: []
        }
    },

    methods: {
        onSubmit() {
            this.all_tasks.push(this.task_1, this.task_2, this.task_3, this.task_4, this.task_5)
            if (this.all_tasks.length >= 3){
                let note = {
                    name: this.name,
                    tasks: [
                        {name: this.task_1, readiness: false},
                        {name: this.task_2, readiness: false},
                        {name: this.task_3, readiness: false},
                        {name: this.task_4, readiness: false},
                        {name: this.task_5, readiness: false},
                    ],
                    data: null,
                    status: 0,
                }
                eventBus.$emit('notes-submitted', note);
                this.name = null;
                this.task_1 = null;
                this.task_2 = null;
                this.task_3 = null;
                this.task_4 = null;
                this.task_5 = null;
            }else {

                if(!this.name) this.errors.push("Name required.")
                if(!this.task_1) this.errors.push("task_1 required.")
                if(!this.task_2) this.errors.push("task_2 required.")
                if(!this.task_3) this.errors.push("task_3 required.")
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