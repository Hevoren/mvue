let eventBus = new Vue()

Vue.component('all-notes', {
    template:`
            <div class="all-notes">
                <create-note></create-note>
                <notes></notes>
            </div>
    `,
})

Vue.component('notes', {
    template: `
        <div class="notes">
            <note :column="columns[0]" :errors="errors_1" :name="nameFirst" :colIndex="colIndex1" @changeTask="changeTask" ></note>
            <note :column="columns[1]" :errors="errors_2" :name="nameSecond" :colIndex="colIndex2" @changeTask="changeTask2"></note>
            <note :column="columns[2]" :errors="errors_3" :name="nameThird" :colIndex="colIndex3"></note>
        </div>
    `,

    data() {
        return {
            columns: [
                [],
                [],
                [],
            ],

            errors_1: [],
            errors_2: [],
            errors_3: [],

            nameFirst: 'Begin',
            nameSecond: 'Continue',
            nameThird: 'End',

            colIndex1: 0,
            colIndex2: 1,
            colIndex3: 2,

            changeTaskArr: [],

        }
    },
    // mounted - вызывается после того, как компонент был добавлен в DOM, т.е. србатывает после того как даннные улетели из формы сюда.
    // после чего он пытается достать и разобрать строку json из localstorage, и если ее нет, присваивает пустой массив
    mounted(){
        // При монтировании компонента, мы проверяем, есть ли в LocalStorage сохраненные данные
        const savedColumns = localStorage.getItem('columns');
        if (savedColumns) {
        // Если данные найдены, мы присваиваем их текущим значениям компонента
            this.columns = JSON.parse(savedColumns);
        }

        // Подписываемся на событие notes-submitted
        eventBus.$on('notes-submitted', note => {
            this.errors_1 = [];
            if (this.columns[0].length < 3) {
                this.columns[0].push(note);
        // После добавления новой заметки в колонку, сохраняем все колонки в LocalStorage
                this.saveNotes();
            } else {
                this.errors_1.push('GABELLA! Maximum count of tasks!');
            }
        });
    },
    // watch отслеживает изменения, если они есть, то он присваивает и сохраняет новые значения, добавляя их в localstorage и преобразовывая ('stringify') в json формат
    watch: {
        // Отслеживаем изменения в колонках и сохраняем их в LocalStorage
        columns: {
            handler: 'saveNotes',
            deep: true
        },

    },
    // saveNote вызывается после выполнения mounted; присваивает и сохраняет значения в localstorage, преобразовывая ('stringify') их в json формат
    methods: {
        saveNotes() {
            // Сохраняем все колонки в LocalStorage
            localStorage.setItem('columns', JSON.stringify(this.columns));
        },

        changeTask(task) {
            let count = 0;
            let countColumn_2 = 0;
            this.columns[task.colIndex][task.indexNote].tasks[task.indexTask].readiness = !this.columns[task.colIndex][task.indexNote].tasks[task.indexTask].readiness;
            const currentDateTime = new Date();

            for(let i = 0; i < this.columns[0][task.indexNote].tasks.length; i++){
                if (this.columns[0][task.indexNote].tasks[i].name !== null) {
                    count++;
                }
            }
            for (let i = 0; i < this.columns[0][task.indexNote].tasks.length; i++) {
                if (this.columns[0][task.indexNote].tasks[i].readiness === true) {
                    countColumn_2 += 1;
                }
            }
            if (countColumn_2 / count * 100 >= 50 && this.columns[1].length < 5) {
                this.columns[1].push(this.columns[0][task.indexNote]);
                this.columns[0].splice(task.indexNote, 1);
            }

            else if(this.columns[1].length === 5){
                if (this.columns[0].length > 0){
                    this.columns[0].forEach(item => {
                        item.columns[0][task.indexNote].tasks.forEach(item => {
                            item.readiness = true
                        })
                    })
                }
            }
        },

        changeTask2(task){
            let count = 0;
            let countColumn_2 = 0;
            this.columns[task.colIndex][task.indexNote].tasks[task.indexTask].readiness = !this.columns[task.colIndex][task.indexNote].tasks[task.indexTask].readiness;
            const currentDateTime = new Date();

            for(let i = 0; i < this.columns[1][task.indexNote].tasks.length; i++){
                if (this.columns[1][task.indexNote].tasks[i].name !== null) {
                    count++;
                }
            }
            for (let i = 0; i < this.columns[1][task.indexNote].tasks.length; i++) {
                if (this.columns[1][task.indexNote].tasks[i].readiness === true) {
                    countColumn_2 += 1;
                }
            }
            if (countColumn_2 / count * 100 >= 50 && this.columns[2].length < 5) {
                this.columns[2].push(this.columns[1][task.indexNote]);
                this.columns[1].splice(task.indexNote, 1);
            }

            else if(this.columns[2].length === 5){
                if (this.columns[1].length > 0){
                    this.columns[1].forEach(item => {
                        item.columns[1][task.indexNote].tasks.forEach(item => {
                            item.readiness = true
                        })
                    })
                }
            }
        }


    }

})

Vue.component('note', {
    props: {
        column: {
            type: Array,
            required: true,

        },
        errors: {
            type: Array,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        colIndex: {
            type: Number,
            required: true
        }
    },

    template: `
        <div>
            <p>{{ name }}</p>
            <div class="note">
                <h1 v-for="error in errors"> {{ error }}</h1>
                <ul>
                    <li v-for="(note, indexNote) in column" class="li-list">
                        <h1>{{ note.name }}</h1>
                        <ul>
                            <li v-for="(task, indexTask) in note.tasks" class="li-task" v-if="task.name !== null" >
                                <p>{{ task.name }}</p>
                                <input type="checkbox" @change="changeKeyTask(indexNote, indexTask, colIndex, name)" :disabled="task.readiness">
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    `,

    methods: {
        changeKeyTask(indexNote, indexTask, colIndex, name){
            this.$emit('changeTask', {indexNote, indexTask, colIndex, name})
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
            id: 0,
            all_tasks: [],
            errors: []
        }
    },

    methods: {
        onSubmit() {
            this.all_tasks = []
            this.errors = []
            this.all_tasks.push(this.task_1, this.task_2, this.task_3, this.task_4, this.task_5)
            this.all_tasks = this.all_tasks.filter(Boolean)
            if (this.all_tasks.length >= 3 ){
                let note = {
                    name: this.name,
                    tasks: [
                        {name: this.task_1, readiness: false},
                        {name: this.task_2, readiness: false},
                        {name: this.task_3, readiness: false},
                        {name: this.task_4, readiness: false},
                        {name: this.task_5, readiness: false},
                    ],
                    id:this.id,
                    status: 0
                }
                this.idUp()
                eventBus.$emit('notes-submitted', note);
                this.name = null;
                this.task_1 = null;
                this.task_2 = null;
                this.task_3 = null;
                this.task_4 = null;
                this.task_5 = null;
            }else {
                this.all_tasks = []
                this.errors.push("GABELLA! From 3 to 5 tasks!")
            }
        },
        idUp(){
            this.id++
        }
    },
})

let app = new Vue({
    el: '#app',
    data: {
        name: 'Notes',
    }
})