#!/bin/bash
# //
# //  Constroi e insere (ou retorna) automaticamente um metodo construtor de uma classe em qualquer codigo Java.
# //  Created by Micael Levi on 10/23/2016
# //  Copyright (c) 2016 mllc@icomp.ufam.edu.br; All rights reserved.
# //


## FIXME
## necessidade de acrescentar uma tag no código.
## dependências externas,
## PROGRAMAS: echo, printf, sed, perl, cat, grep, tail, mktemp.
## SCRIPTS: removerComentarios.sed, constructorGenerator.pl.


# --------------------[ CONFIGURAÇÕES ]-------------------- #
readonly REMOVER_COMENTARIOS="removerComentarios.sed"
readonly GERADOR_CONSTRUTOR="constructorGenerator.pl"
readonly binSed="/usr/bin/sed -nf"
readonly binPerl="/usr/bin/perl"
readonly sep=:
# ----------------------------------------------------------- #

# --------------------[ DEFAULT DAS OPÇÕES ]-------------------- #
Verbose=0   # nao mostra o log (3).
InPlace=0   # mostra na STDOUT (2).
OverWrite=0 # nao insere o construtor se ja exisitir.
Delete=0    # nao apaga a linha da tag.
OneLine=0   # construtor identado.
Quiet=0     # cometario de Auto-generated.
Sorted=0    # parametros inseridos na ordem das declaracoes.
# -------------------------------------------------------------- #

# --------------------[ VARIÁVEIS GLOBAIS READONLY ]---------------------- #
OPTS_PERL=
SUFIX=""
FILEPATH=""
NOME_CONSTRUTOR=""
declare -i QTD_ATT=0
declare -a ATRIBUTOS=0
declare -i LINHA_INSERCAO=-1
CONSTRUTOR=""
PROTOTIPO=""
declare -i CONSTRUTOR_EXISTE=0
declare -i QTD_CONSTRUTORES=0
ARQ_CONSTRUTOR=""
# ------------------------------------------------------------------------- #





NOT(){
  if(($1)); then
    echo 0
  else
    echo 1
  fi
}


_showLogMessage(){
  if [ $# -ge 1 ]; then
    local msg="[${1^^}]";
    local N=$(($RANDOM % 8 + 31));
    echo -e "\033[40;${N};1m${msg}\033[m" 1>&2;
  fi
}
_criarArquivoTempComConteudo(){
  _showLogMessage "CRIANDO ARQUIVO TEMPORÁRIO"


  local tempFile=$(mktemp "${TMPDIR:-/tmp/}XXXXXXXX.construtor");
  printf "$1" > $tempFile;
  echo $tempFile;
}


_checkDependencies(){
  _showLogMessage "verificando dependecias";
  local ERROR=;

  if not command -v perl >/dev/null 2>&1; then ERROR+=1; fi
  if not command -v sed >/dev/null 2>&1; then ERROR+=2; fi
  if not command -v cat >/dev/null 2>&1; then ERROR+=3; fi
  if not command -v grep >/dev/null 2>&1; then ERROR+=4; fi
  if not command -v tail >/dev/null 2>&1; then ERROR+=5; fi
  if not command -v mktemp >/dev/null 2>&1; then ERROR+=6; fi

  [ -x "$REMOVER_COMENTARIOS" ] || ERROR+=7
  [ -x "$GERADOR_CONSTRUTOR" ] || ERROR+=8
  ((ERROR)) && {
    _showLogMessage "Erro nas dependencias! ($ERROR)";
    exit 10;
  }
}


_help(){
  echo -e "\
  USSAGE: \033[36;1m${0}\033[m \033[40;33m[OPTIONS] [-mN, --modifierN] [-i[SUFIX], --in-place[=SUFIX]]\033[m \033[40;31mpathToFile.java\033[m
  OPTIONS:
    -h        --help        :mostrar ajuda. [false]
    -v        --verbose     :mostrar logs. [false]
    -o        --over-write  :inserir mesmo que ja exista um construtor com o mesmo prototipo. [false]
    -d        --delete      :remover a linha que contem a tag. [false]
    -l        --one-line    :o metodo construtor tera apenas uma linha. [false]
    -q        --quiet       :nao mostrar linha de comentario 'Auto-generated'. [false]
    -S        --sorted      :os parametros serao inseridos de forma ordenada (alfabetica pelo nome da variavel). [false]\
    "
  exit 1
}
_especificacoes(){
  cat <<EOF
  1. Caso exista o construtor default, ele não deve conter escopos locais.
  2. Um linha (comentada) com a TAG  "@attN"  deve anteceder as declarações dos atributos, onde "N" é a quantidade de atributos.
  3. Os atributos da classe devem estar declarados UM por linha.
  4. Por padrão, os parâmetros são inseridos na ordem em que eles aparecem (na declaração).
EOF
  echo
  _help;
  exit 2;
}


#### [ LER E DEFINIR ATRIBUTOS ] ####
_atributos(){
  _showLogMessage "LENDO E DEFININDO ATRIBUTOS"


  FILENAME=$(grep -Poie '\w+\.java' <<< ${FILEPATH} | sed -r 's/(.)(.+)/\U\1\L\2/');
  readonly NOME_CONSTRUTOR="${FILENAME%%.java}";

  readonly ANALISE=$(grep -n -m1 -Po '(?<=@att)[[:blank:]]*(\d+)' ${FILEPATH}); ## <numeroDaLinha>:<quantidadeDeAtributos>
  QTD_ATT=$(grep -Poe '(?<=:)\w' <<< $ANALISE); # cut -d: -f2

  readonly ARQUIVO="$(sed -r "s/.*(@att${QTD_ATT}).*/\1/1" ${FILEPATH} | ${binSed} ${REMOVER_COMENTARIOS} | sed '/^[[:blank:]]*$/d ; s/^[[:blank:]]*//')";
  declare -i LINHA_TAG=$( sed -n "/@att${QTD_ATT}/{=;q;}" <<< "${ARQUIVO}");

  local linhaInicial=$((LINHA_TAG+1));
  local linhaFinal=$((LINHA_TAG+QTD_ATT));
  ATRIBUTOSstr=$(sed -n "${linhaInicial} , ${linhaFinal} p" <<< "$ARQUIVO" | sed -r "s/(\w+)[[:blank:]]+(\w+)\W*/\2${sep}\1/"); # ATRIBUTOS=$(grep -A${QTD_ATT} -i -w "@att${QTD_ATT}" <<< "$ARQUIVO" | tail -${QTD_ATT} | sed -r "s/(\w+)[[:blank:]]+(\w+)\W*/\2${sep}\1/");
  ((Sorted)) && ATRIBUTOSstr=$(sort -d <<< "$ATRIBUTOSstr");

  ATRIBUTOS=($ATRIBUTOSstr);
  [[ $QTD_ATT -ne ${#ATRIBUTOS[@]} ]] && { echo _showLogMessage "a quantidade de atributos não confere com a especificada pela tag"; exit 5; }
}


#### [ OBTER LINHA EM QUE O CODIGO DO CONSTRUTOR SERÁ INSERIDO ] ####
_linhaConstrutor(){
  _showLogMessage "RECUPERANDO LINHA EM QUE SERÁ INSERIDO"


  #1) Se o construtor default estiver presente (recupera a linha da última):
  LINHA_INSERCAO=$(sed -rn "/${NOME_CONSTRUTOR}[[:blank:]]*\(\)/ , /}/ =" ${FILEPATH} | tail -1);
  #2) Se o construtor default não estiver no código (recupera a linha da última chave fechada ):
  [[ $LINHA_INSERCAO -le 0 ]] && LINHA_INSERCAO=$(sed -n '/}/ , /$/{ $b; =; }' ${FILEPATH} | tail -1);
}


#### [ GERAR O MÉTODO CONSTRUTOR PARAMETRIZADO ] ####
_gerarConstrutor(){
  _showLogMessage "GERANDO O MÉTODO CONSTRUTOR PARAMETRIZADO"

  readonly CONSTRUTOR="$(${binPerl} ${GERADOR_CONSTRUTOR} $OPTS_PERL $FILENAME ${ATRIBUTOS[@]})";
  readonly PROTOTIPO="$(grep -m1 -Eo '\w+\(.+)' <<< "$CONSTRUTOR")";

  #### [ VERIFICAR SE ALGUM CONSTRUTOR COM A MESMA QUANTIDADE DE ATRIBUTOS] ####
  ((OverWrite)) || CONSTRUTOR_EXISTE=$(grep -c -w "${PROTOTIPO}" ${FILEPATH});
}


_alterarArquivo(){
  _showLogMessage "ALTERANDO (OU NÃO) ARQUIVO ORIGINAL"


  #### [ CRIAR ARQUIVO TEMPORÁRIO CUJO O CONTEÚDO SEJA O CONSTRUTOR ] ####
  readonly ARQ_CONSTRUTOR=$(_criarArquivoTempComConteudo "\n$CONSTRUTOR\n");
  # cat $ARQ_CONSTRUTOR;
  local COMANDO_SED="${LINHA_INSERCAO}r ${ARQ_CONSTRUTOR}"
  local OPTS_SED=

  #### [ INSERIR O CONSTRUTOR NO ARQUIVO PASSADO NA LINHA ENCONTRADA ] ####
  ((InPlace)) && OPTS_SED=-i${SUFIX}
  ((CONSTRUTOR_EXISTE)) && COMANDO_SED=

  sed $OPTS_SED -e "${COMANDO_SED}" "$FILEPATH";
  ((Delete)) && sed "/@att${QTD_ATT}/{d;q}" "$FILEPATH";

  rm -f $ARQ_CONSTRUTOR;
}




_main(){

  _checkDependencies;

  FILEPATH=${@%% };
  [ ! -r "$FILEPATH" ] && _especificacoes;

  (($Verbose)) || exec 2>/dev/null;


  ####################
  _atributos;
  _linhaConstrutor;
  _gerarConstrutor;
  _alterarArquivo;
  ####################

}



#####################################################################################################################

[ $# -eq 0 ] && _especificacoes;

OPTS=`getopt -o :hvodlqSm:i: --long help,verbose,over-write,delete,one-line,quiet,sorted,in-place: -n 'parse-options' -- "$@"`
[ $? != 0 ] && _help ;
eval set -- "$OPTS";
while :
do
  opt="";
  case "$1" in
    -h | --help ) _help; opt=h ;;
    -v | --verbose ) Verbose=$(NOT $Verbose); opt=v ;;
    -o | --over-write ) OverWrite=$(NOT $OverWrite);;
    -d | --delete ) Delete=$(NOT $Delete) ;;
    -l | --one-line ) OneLine=$(NOT $OneLine); opt=l ;;
    -q | --quiet ) Quiet=$(NOT $Quiet); opt=q ;;
    -S | --sorted ) Sorted=$(NOT $Sorted) ;;
    -m | --modifier ) [ -n "$4" ] && { opt=m${2:0:1}; shift; } ;;
    -i | --in-place ) InPlace=$(NOT $InPlace); SUFIX=${4:+$2}; [ -n "$SUFIX" ] && shift ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
  # OPTS_PERL+=$1" ";
  OPTS_PERL+=" "-$opt;
  shift;
done
: '
echo
echo "[$OPTS]"
echo "{$@}"
echo Verbose=${Verbose}
echo OverWrite=${OverWrite}
echo Delete=${Delete}
echo OneLine=${OneLine}
echo silence=${silence}
echo Sorted=${Sorted}
echo InPlace=${InPlace}
echo
'


_main "${@%%--}"
#####################################################################################################################
